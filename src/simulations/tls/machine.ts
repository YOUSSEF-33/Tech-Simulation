export type CheckId = 'issuer' | 'expiry' | 'domain';

export interface TlsData {
  certOpen: boolean;
  certSeen: boolean;
  checks: Record<CheckId, boolean>;
  keyReady: boolean;
  secretSent: boolean;
  insecure: boolean;
  hint: number;
}

export interface TlsState {
  status: 'idle' | 'running' | 'won';
  step: number;
  data: TlsData;
}

export type TlsAction =
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' }
  | { type: 'hint' }
  | { type: 'openCert' }
  | { type: 'closeCert' }
  | { type: 'check'; id: CheckId }
  | { type: 'createKey' }
  | { type: 'sendSecret' }
  | { type: 'toggleInsecure' };

export const TOTAL_STEPS = 6;

export const CHECK_IDS: CheckId[] = ['issuer', 'expiry', 'domain'];

export const initialTlsState: TlsState = {
  status: 'idle',
  step: 0,
  data: {
    certOpen: false,
    certSeen: false,
    checks: { issuer: false, expiry: false, domain: false },
    keyReady: false,
    secretSent: false,
    insecure: false,
    hint: 0,
  },
};

export function allChecksPassed(data: TlsData): boolean {
  return CHECK_IDS.every((id) => data.checks[id]);
}

export function canAdvance(state: TlsState): boolean {
  if (state.status !== 'running') return false;
  if (state.step === 2) return state.data.certSeen;
  if (state.step === 3) return allChecksPassed(state.data);
  if (state.step === 4) return state.data.keyReady;
  if (state.step === 6) return state.data.secretSent;
  return true;
}

export function isSuccess(state: TlsState): boolean {
  return state.data.keyReady && allChecksPassed(state.data) && state.data.secretSent;
}

export function reduce(state: TlsState, action: TlsAction): TlsState {
  switch (action.type) {
    case 'start':
      if (state.status !== 'idle') return state;
      return { ...state, status: 'running', step: 1 };

    case 'next': {
      if (state.status !== 'running') return state;
      if (state.step >= TOTAL_STEPS) {
        if (isSuccess(state)) return { ...state, status: 'won' };
        return state;
      }
      if (!canAdvance(state)) return state;
      return { ...state, step: state.step + 1, data: { ...state.data, hint: 0 } };
    }

    case 'prev': {
      if (state.status === 'idle') return state;
      if (state.step <= 1) return { ...state, status: 'idle', step: 0 };
      return { ...state, step: state.step - 1, data: { ...state.data, hint: 0 } };
    }

    case 'reset':
      return initialTlsState;

    case 'hint':
      return { ...state, data: { ...state.data, hint: Math.min(3, state.data.hint + 1) } };

    case 'openCert':
      if (state.step < 2) return state;
      return { ...state, data: { ...state.data, certOpen: true, certSeen: true } };

    case 'closeCert':
      return { ...state, data: { ...state.data, certOpen: false } };

    case 'check':
      if (state.step !== 3) return state;
      return {
        ...state,
        data: { ...state.data, checks: { ...state.data.checks, [action.id]: true } },
      };

    case 'createKey':
      if (state.step !== 4) return state;
      return { ...state, data: { ...state.data, keyReady: true } };

    case 'sendSecret':
      if (state.step !== 6) return state;
      return { ...state, data: { ...state.data, secretSent: true } };

    case 'toggleInsecure':
      return { ...state, data: { ...state.data, insecure: !state.data.insecure } };

    default:
      return state;
  }
}
