# DATABASE SCHEMA — نموذج البيانات

> **MVP decision:** there is no database. Content lives in typed files; progress lives in a versioned localStorage document. This document (a) specifies that document precisely, (b) specifies the Postgres schema to adopt when accounts arrive, and (c) states the rule for which data belongs where.

---

## 1. Storage tiers

| Tier | Holds | Technology (MVP) | Technology (Phase 5) |
|---|---|---|---|
| T0 — Source | Units, lessons, blocks, questions, sim metadata | TypeScript modules in `src/content/` | same (files stay) |
| T1 — Device | Progress, quiz attempts, sim completions, activity days | `localStorage['manhag.progress.v1']` | mirrored locally, synced when signed in |
| T2 — Server | Accounts, sessions, synced progress | — | PostgreSQL + Prisma |
| T3 — Assets | Fonts, SVG diagrams, og image | `public/` | same / CDN |

**Rule:** anything a student *reads* is T0 (immutable per deploy, identified by a stable slug). Anything a student *does* is T1 → T2. Never store content in the database while it is authored in git — two sources of truth guarantee drift.

---

## 2. Canonical content identifiers (must never change)

| Entity | ID format | Example | Stability |
|---|---|---|---|
| Unit | `U1`…`U4` | `U2` | permanent |
| Lesson | `U{unit}-L{n}` | `U2-L1` | permanent |
| Objective | `{lessonId}-O{n}` | `U2-L1-O4` | permanent |
| Quiz | `Q-{lessonId}` | `Q-U2-L1` | permanent |
| Question | `Q-{lessonId}-{n}` | `Q-U2-L1-3` | permanent |
| Simulation | `SIM-{NAME}-{nn}` | `SIM-TLS-01` | permanent |
| Slug | kebab-case, human | `u2-1-encryption-auth` | permanent (URL) |

**Why IDs are separate from slugs:** a teacher may want to rename a lesson title or slug; progress must survive that. All stored progress references **IDs**, never titles or slugs. Renaming a slug requires a redirect entry, not a data migration.

---

## 3. The localStorage document (MVP schema)

**Key:** `manhag.progress.v1` · **Written by:** Zustand `persist` (single write per action) · **Size estimate:** < 30 KB for 11 lessons + 30 attempts.

```ts
interface ProgressDocument {
  schemaVersion: 1;
  createdAt: string;              // ISO
  updatedAt: string;              // ISO
  lessons: Record<LessonId, LessonRecord>;
  sims: Record<SimId, SimRecord>;
  attempts: Record<QuizId, AttemptRecord[]>;   // newest first, max 20
  activityDays: string[];         // 'YYYY-MM-DD', max 60, newest first
  lastLessonId?: LessonId;
}

interface LessonRecord {
  readAt?: string;                // reached final section / pressed «أنهيت الدرس»
  completedAt?: string;           // derived & written when read + quiz ≥ 60%
  lastSectionId?: string;         // reading position (mobile resume)
}

interface SimRecord {
  status: 'attempted' | 'completed';
  completedAt: string | null;
  attempts: number;
  hintsUsed: 0 | 1 | 2 | 3;       // max level used, not count per step
  durationSec: number;
  lastStep: number;               // for the «تابع من حيث توقفت» hint only
  version: 1;
}

interface AttemptRecord {
  id: string;                     // crypto.randomUUID()
  at: string;                     // ISO
  score: number;                  // 0..5
  total: number;                  // 5
  durationSec: number;
  answers: Array<{
    questionId: string;           // 'Q-U2-L1-3'
    choiceId: string;             // stable choice id, never an index
    correct: boolean;
    hintsUsed?: number;
  }>;
  contentVersion: string;         // detects attempts made against older content
}
```

### 3.1 Rules

1. **Append-only attempts** (cap 20/lesson, drop oldest) so "best" and "last" are both derivable.
2. **Derived, never stored twice:** lesson completeness, unit ratio, streak, overall percentage. Storing them invites inconsistency after a content change.
3. **Choice IDs are strings** (`'a' | 'b' | 'c' | 'd'` authored per question), never array indices — shuffling must not corrupt stored answers.
4. **`contentVersion` mismatch:** attempts are kept but the review UI shows «هذا الاختبار تغيّر منذ محاولتك» when the question no longer exists; missing `questionId`s are skipped, not crashed on.
5. **Unknown keys** are stripped on read (zod `.strip()`), so an older/newer build cannot corrupt state.
6. **Write failures** (quota, private mode, disabled storage) degrade to in-memory + one Arabic toast; no feature is blocked.

### 3.2 Migration policy

| From → to | Action |
|---|---|
| `v1` → `v2` | Pure `migrate(doc, fromVersion)` that adds defaulted fields; never drops attempts |
| Corrupt JSON | Reset to empty doc, toast «تعذّر قراءة تقدّمك السابق. بدأنا من جديد.» |
| Unknown schemaVersion (newer) | Read-only: warn «حدّث الصفحة للحصول على آخر إصدار» and do not write |
| Key rename (`manhag.progress.v1` → v2) | Read v1 once, migrate, write v2, leave v1 untouched for one release |

---

## 4. PostgreSQL schema (Phase 5)

Adopt when accounts are enabled. **No content tables** — the DB stores identity and behaviour only.

### 4.1 Prisma schema

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String                      // argon2id, never echoed
  displayName   String?   @db.VarChar(60)   // optional, Arabic allowed
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?                   // soft delete, purge after 30 days

  sessions      Session[]
  lessonStates  LessonProgress[]
  simStates     SimulationProgress[]
  attempts      QuizAttempt[]

  @@index([deletedAt])
}

model Session {
  id        String   @id                        // opaque random, hashed in cookie
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model LessonProgress {
  id          String    @id @default(cuid())
  userId      String
  lessonId    String    @db.VarChar(16)         // 'U2-L1' — content lives in git
  readAt      DateTime?
  completedAt DateTime?
  lastSectionId String? @db.VarChar(64)
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId, completedAt])
}

model SimulationProgress {
  id          String    @id @default(cuid())
  userId      String
  simId       String    @db.VarChar(24)         // 'SIM-TLS-01'
  status      String    @db.VarChar(16)         // 'attempted' | 'completed'
  completedAt DateTime?
  attempts    Int       @default(0)
  hintsUsed   Int       @default(0)             // 0..3
  durationSec Int       @default(0)
  lastStep    Int       @default(0)
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, simId])
  @@index([userId, status])
}

model QuizAttempt {
  id             String    @id @default(cuid())
  userId         String
  quizId         String    @db.VarChar(24)      // 'Q-U2-L1'
  lessonId       String    @db.VarChar(16)
  score          Int
  total          Int
  durationSec    Int
  contentVersion String    @db.VarChar(32)
  createdAt      DateTime  @default(now())
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers        AttemptAnswer[]

  @@index([userId, quizId, createdAt(sort: Desc)])
  @@index([userId, lessonId])
}

model AttemptAnswer {
  id         String      @id @default(cuid())
  attemptId  String
  questionId String      @db.VarChar(24)        // 'Q-U2-L1-3'
  choiceId   String      @db.VarChar(8)         // 'a'..'d'
  correct    Boolean
  attempt    QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@unique([attemptId, questionId])
  @@index([attemptId])
}
```

> If a self-hosted auth library is used (Better Auth / Auth.js), its own `User`/`Session`/`VerificationToken` tables replace or extend the two above; keep `passwordHash` inside the library's model rather than duplicating it. **Verify the current adapter contract at Phase 5** — this plan deliberately does not pin a library version.

### 4.2 Entity reference

| Entity | Purpose | Required fields | Optional | Relationships | Indexes |
|---|---|---|---|---|---|
| `User` | account identity | `id`, `email`, `passwordHash`, `createdAt` | `displayName`, `emailVerified`, `deletedAt` | 1—N sessions, progress, attempts | unique `email`; `deletedAt` |
| `Session` | server session | `id`, `userId`, `expiresAt` | — | N—1 user (cascade) | `userId`; `expiresAt` |
| `LessonProgress` | per-lesson state | `id`, `userId`, `lessonId` | `readAt`, `completedAt`, `lastSectionId` | N—1 user | unique (`userId`,`lessonId`); (`userId`,`completedAt`) |
| `SimulationProgress` | per-sim state | `id`, `userId`, `simId`, `status` | `completedAt` | N—1 user | unique (`userId`,`simId`); (`userId`,`status`) |
| `QuizAttempt` | one attempt | `id`, `userId`, `quizId`, `lessonId`, `score`, `total`, `contentVersion`, `createdAt` | `durationSec` (default 0) | N—1 user; 1—N answers | (`userId`,`quizId`,`createdAt` desc); (`userId`,`lessonId`) |
| `AttemptAnswer` | per-question answer | `id`, `attemptId`, `questionId`, `choiceId`, `correct` | — | N—1 attempt (cascade) | unique (`attemptId`,`questionId`) |

**Deliberately absent:** `Unit`, `Lesson`, `Section`, `Question`, `AnswerChoice` tables. Content is compiled into the bundle; duplicating it in SQL creates two truths and forces a sync job for zero benefit. If a CMS is ever built (v2), those tables are added then — with `contentVersion` as the join key to existing attempts.

### 4.3 Constraints and data rules

- `score >= 0 AND score <= total`, `total > 0` — CHECK constraints.
- `status IN ('attempted','completed')` — CHECK or enum.
- `hintsUsed BETWEEN 0 AND 3`.
- `lessonId`/`simId`/`quizId` are **not** foreign keys (content is not in the DB) but must match the ID patterns; validate in the API layer against a build-time exported manifest.
- All timestamps `timestamptz`, stored UTC, rendered in Africa/Cairo for display.
- Cascade deletes on user removal; hard purge job for soft-deleted users after 30 days.

### 4.4 Query patterns the schema must serve

| Query | Path | Index used |
|---|---|---|
| Dashboard: lesson states for one user | `WHERE userId = ?` | (`userId`,`lessonId`) |
| Lesson page: last attempt | `WHERE userId = ? AND quizId = ? ORDER BY createdAt DESC LIMIT 1` | (`userId`,`quizId`,`createdAt` desc) |
| Progress page: best score per quiz | `GROUP BY quizId MAX(score)` | same |
| Sync: merge device doc | upsert on unique (`userId`,`lessonId`) and (`userId`,`simId`) | uniques |
| Retention: purge deleted users | `WHERE deletedAt < now() - 30 days` | `deletedAt` |

### 4.5 Sync contract (Phase 5)

`POST /api/progress/sync` accepts the device document (validated by the same zod schema) and returns the merged document.

- Lessons/sims: **newest `updatedAt` wins** per ID.
- Attempts: union by `id` (client UUIDs), newest 20 per quiz kept.
- `activityDays`: union.
- Server is authoritative for `User`, never for content IDs.
- Idempotent: replaying the same payload changes nothing.
- Response is `private, no-store`.

---

## 5. Data volume and performance

| Table | Rows at 500 students | Notes |
|---|---|---|
| `User` | 500 | |
| `Session` | ~1,500 | purge expired nightly |
| `LessonProgress` | ≤ 5,500 | 11 per student |
| `SimulationProgress` | ≤ 2,000 | 4 per student |
| `QuizAttempt` | ~10,000 | ~20 per student |
| `AttemptAnswer` | ~50,000 | 5 per attempt |

Total < 100 MB. A single small instance is ample; no partitioning, no read replicas, no caching layer.

---

## 6. Privacy and retention

| Data | Retention | Deletion |
|---|---|---|
| Device progress | Until the student clears storage or presses «حذف تقدّمي» | immediate, local |
| Attempts (server) | While the account exists | account deletion cascades |
| Soft-deleted users | 30 days | nightly purge job |
| Sessions | Until expiry (30 days) | cascade + nightly purge |
| No PII beyond email/password hash | — | — |

MVP collects **nothing**: no email, no IP logging, no analytics. The privacy page states this in Arabic.

---

## 7. What is deliberately *not* modelled

- Classrooms, teachers, cohorts, assignments, grades — requires institutional decisions (CU-07).
- Content versioning tables — content is versioned by git.
- Media uploads — diagrams are SVGs in the repo.
- Event/analytics streams — privacy-first, post-MVP, aggregate only.
- Gamification (XP, badges) — not required by the curriculum; see `ROADMAP.md` Phase 8.
