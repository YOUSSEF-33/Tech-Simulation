import {
  initialTlsState,
  reduce,
  canAdvance,
  isSuccess,
  type TlsAction,
  type TlsState,
} from '../src/simulations/tls/machine.ts';

let failures = 0;

function check(name: string, condition: boolean): void {
  if (condition) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}`);
  }
}

function run(state: TlsState, actions: TlsAction[]): TlsState {
  return actions.reduce(reduce, state);
}

let state = run(initialTlsState, [{ type: 'start' }]);
check('start → step 1, running', state.status === 'running' && state.step === 1);

state = reduce(state, { type: 'next' });
check('advance → step 2 (server certificate)', state.step === 2);

check('certificate gate blocks advancing before opening', reduce(state, { type: 'next' }).step === 2);

state = run(state, [{ type: 'openCert' }, { type: 'closeCert' }]);
check('gate stays open after closing the dialog', canAdvance(state));

state = reduce(state, { type: 'next' });
check('advance → step 3 (verification)', state.step === 3);
check('verification blocks before any check', !canAdvance(state));

state = run(state, [
  { type: 'check', id: 'issuer' },
  { type: 'check', id: 'expiry' },
]);
check('two of three checks still blocks', !canAdvance(state));

state = reduce(state, { type: 'check', id: 'domain' });
check('three checks allow advancing', canAdvance(state));

state = reduce(state, { type: 'next' });
check('advance → step 4 (session key)', state.step === 4);
check('session key required before advancing', !canAdvance(state));

state = reduce(state, { type: 'createKey' });
check('session key created on both sides', state.data.keyReady);

state = reduce(state, { type: 'next' });
check('advance → step 5 (finished)', state.step === 5);

state = reduce(state, { type: 'next' });
check('advance → step 6 (encrypted data)', state.step === 6);
check('cannot finish before sending the secret', !canAdvance(state));

state = reduce(state, { type: 'sendSecret' });
check('secret sent', state.data.secretSent);

state = reduce(state, { type: 'next' });
check('success state reached', state.status === 'won' && isSuccess(state));

state = run(state, [
  { type: 'hint' },
  { type: 'hint' },
  { type: 'hint' },
  { type: 'hint' },
]);
check('hints cap at level 3', state.data.hint === 3);

check(
  'invalid action for the step is ignored',
  reduce(state, { type: 'createKey' }).data.keyReady === state.data.keyReady,
);

const reset = reduce(state, { type: 'reset' });
check(
  'reset clears everything',
  reset.step === 0 && reset.status === 'idle' && !reset.data.certSeen && !reset.data.keyReady,
);

const skipped = run(initialTlsState, [
  { type: 'start' },
  { type: 'do' as never },
]);
check('unknown action never throws', skipped.step === 1);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
