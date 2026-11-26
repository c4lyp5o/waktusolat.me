# AGENTS.md

Guidance for AI coding agents working on waktusolat.me, the public prayer-times site. **ez rules** are shared with the ez repos; **This repo** is specific to waktusolat.me. Humans: [DEVELOPER.md](DEVELOPER.md) has the same commands with more context.

<!-- ez-standard:start v2 — shared by every ez repo; edit the copy in the Hermes ez-series skill and re-sync, not this block. -->
## ez rules (shared by every ez repo)

### Ground rules

1. **No commits, pushes, PRs, tags, releases or deploys without the owner's explicit OK.** Patch, test, report.
2. **Never print, log or commit secrets.** No tokens, passwords, keys or webhook URLs in code, fixtures, logs, chat or commit messages. `.env` is never committed and never copied into an image.
3. **Never report a check as passing unless you ran it.** Quote the real output and numbers; a skipped check is not a pass.
4. **Tests never touch real data or real services.** Use temp dirs, throwaway database containers and mocked HTTP. Never point a test at a running instance.
5. **Prove a regression test catches the bug.** Undo the fix, watch the test fail, restore it.

### Branches and releases

- `development` is the integration branch. Branch from it (`feat/…`, `fix/…`, `chore/…`) and open every PR against it.
- `master` is released code. Only `development` merges into it, by PR. There is no `main`, `dev` or `staging`.
- Release (only with the owner's OK): bump every `package.json` version, move `[Unreleased]` in `CHANGELOG.md` under `## [x.y.z] - YYYY-MM-DD`, merge `development` into `master`. Merging to `master` publishes `:<version>`, `:latest` and `:sha-<commit>`; a `vX.Y.Z` tag is optional and adds a GitHub Release.
- CI is two workflows in every repo: `test.yml` (lint, tests, build, image booted and healthy; on PRs) and `publish.yml` (runs `test.yml`, then publishes; byte-identical across repos except `IMAGE`). Pushes to `development` publish `:development` and `:sha-<commit>` only, never `:latest` or a version; run a dev image as a separate container with its own data, not in place of the live one. Optional release files come from `scripts/release-assets.sh`.
- Conventional Commits (`fix(scope): …`) with a body that says why. User-visible changes get a `CHANGELOG.md` line under `[Unreleased]`.

### Stack and style

- **Bun for everything**, never npm or node. The Bun version in `Dockerfile` (`oven/bun:x.y.z`) and every `bun-version:` in `.github/workflows/` must match.
- ESM, tabs, double quotes, semicolons. Minimal, task-scoped diffs; don't reformat files you didn't change. Comments explain why, not what.
- **Docs**: `README.md`, `DEVELOPER.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`, plus `LICENSE` (MIT) in public repos; nothing else. No roadmaps, plans or TODO lists in the repo; they live with the owner.
- **Biome is the only linter**, pinned at the repo root: `bun run lint`, `bun run lint:fix`. No ESLint or Prettier. Markdown is not run through Biome.
- **Frontend**: React + Vite + Tailwind 4 in the ez house style (shared `src/ez/` kit and tokens; ezllm is the reference). Colours come from tokens, never raw palette classes. Motion animates transform and opacity only.
- **Brand**: every header, sidebar and sign-in shows `<Brand name="ezname" scope="…" />` (in `src/ez/`): the ez icon at 20px, the lowercase name, an optional scope. App names are always lowercase (`eziarr`, never `Eziarr`), in UI and docs.
- **Icons**: every app uses the shared ez icon from ezconv: `public/icons/icon-192.png` and `icon-512.png`, linked as `rel="icon"` and `rel="apple-touch-icon"` and used in any web manifest.
- **React Compiler** runs through `@rolldown/plugin-babel` with `reactCompilerPreset()`. `@vitejs/plugin-react` 6 has no `babel` option; passing one silently disables the compiler.

### Writing docs

User docs are easy, straightforward and for everyone. The models are ezllm's [README](https://github.com/c4lyp5o/ezllm/blob/development/README.md), [bridge pages](https://github.com/c4lyp5o/ezllm/tree/development/docs/bridges) and [troubleshooting page](https://github.com/c4lyp5o/ezllm/blob/development/docs/bridges/troubleshooting.md). Open one and match it.

- **Structure**: one page or section, one job, titled with the task ("Turn on ChatGPT"). What you need, then numbered steps that start with a verb, then what success looks like ("You should see …"), then links for "Not working?" and "How it works". When setups differ, let the reader pick one up front and skip the rest. Troubleshooting is a table: *the log says* / *do this*.
- **Tone**: talk to "you" in plain words. Explain a term the first time. Say what a step costs or changes. State a warning as a fact with its reason, right where it matters. No hype, jokes or apologies.
- **Cadence**: short sentences, one idea each; paragraphs of one to three lines. Say what a block does, then show the block. Each block is one action that pastes whole, with no comments inside. Cut any sentence that does not help with the next step.
- **Scope**: describe the current version only. Reasons, limits and measurements go in reference docs, not in the steps.
- **Examples** use neutral names (`acme`, `my-app`, `example.com`, `/home/you`), never anyone's real setup.
- **Before it ships**: run every command as printed; match UI labels and log lines word for word; check that links resolve.

### Dependencies

- Lockfiles are committed. CI and Docker install with `--frozen-lockfile`. Don't touch a lockfile unless the dependency change is intentional, and review its diff.
- Prefer releases at least a week old. Take majors one at a time and keep one only if lint, tests and build pass. Read the changelog for removed exports and options; a passing build is not proof (archiver 8 and plugin-react 6 both passed builds while breaking the app).

### Docker

- One Dockerfile shape in every repo (the ez standard): a `build` stage on `oven/bun:x.y.z-alpine` for the frontend, then an Alpine runtime with OCI labels, `--production --frozen-lockfile --ignore-scripts`, `USER bun` (uid 1000) and `HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --start-interval=2s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT}<health>"`. Static apps use `nginx-unprivileged` with the same healthcheck.
- No root processes at runtime: no crond or root entrypoints. Schedule recurring jobs inside the app.
- **All state lives under `DATA_DIR`**: `/data` in the image (created, `chown`ed to `bun` and declared `VOLUME ["/data"]`), `<repo>/data` from source (gitignored). The database is `$DATA_DIR/<app>.sqlite`; uploads, hosted files and logs are subfolders (`$DATA_DIR/logs`). One mount per app: `./<app>-data:/data`. Never write to a relative path. When moving state, keep reading the old location until it is moved (`keepLegacy` in `datadir.js`) so an upgrade never starts on an empty database.
- **Logging** (every app with a backend): deadslog through the shared `ezlog.js` `createLogger(logDir, name)`: the console plus `$DATA_DIR/logs/<name>.log`, rotated at 5 MB with 3 files kept. One file per process (a worker gets `<app>-worker.log`, a pm2 cluster instance `<name>-<n>.log`); two processes must never share a file. No `console.*` in app code, except command-line output and secrets that must never reach a log file (such as a first-start setup code).
- Configuration comes from the environment at runtime (`env_file` in compose). Never `COPY .env`.
- After changing the `Dockerfile`, the Bun version or a dependency, build the image and boot it with throwaway config. Tests don't load every entry point (workers especially).

### Before you say it's done

Run the lint, tests and build listed under **This repo** and report the numbers. For UI changes, also check the page in a real browser at 390px and desktop widths.
<!-- ez-standard:end -->

## This repo

### What it is

A public prayer-times site for Malaysia, with three faces on one codebase: the website, a mosque editor (registry, programmes, photos) and a TV display that a mosque can put on a screen. Times come from JAKIM, cached as JSON; visitors, mosques, programmes and photos live in SQLite.

- **Server** — Elysia (`server.js`), routes in `routes/api.js`, GraphQL through `@elysiajs/apollo` (`graphql/`), zone chat over socket.io, SQLite through `bun:sqlite` (`db/db.js`).
- **Client** — React + Vite in `client/`, four surfaces: `pages/` (the site), `web/layouts/` (the printed page pool), `tv/` (TV boards and the service worker), `mosque/` (the editor).
- **One tema registry** — `shared/temas.js` is imported by the client *and* the server. It is the only place a tema's id, name, mode, swatch and per-surface layout are defined.
- **Times** — `data/times/*.json`, fetched from JAKIM by `data/getter.js` (`bun run get-times`).

### Commands

Run from the repo root with [Bun](https://bun.sh).

| Task | Command |
| --- | --- |
| Install both packages | `bun run install-all` |
| Run server and client together | `bun run dev` |
| Run the server alone | `bun run server` |
| Refresh the JAKIM times cache | `bun run get-times` |
| Run the test suite | `bun run test` |
| Lint with Biome | `bun run lint` |
| Build the client | `bun run build-client` |
| Start in production | `bun run start` |

### Tests

`bun run test` runs `tests/` with `bun:test` — 267 tests across 29 files.

`tests/app.js` is the shared route harness: it points `DB_PATH` at a temp SQLite file **before** the app is imported, because `db/db.js` reads the path when the database opens and Bun shares the module cache across test files. A test must never open `./db/visitors.sqlite`.

### Repo rules

- **A tema is one entry in `shared/temas.js`.** Adding a tema means adding its row there, plus its page in `client/src/web/layouts/index.js` for the site — and for the TV, its stylesheet in `client/src/tv/layouts/` and its screen wired into the `layout` dispatch in `client/src/tv/TvApp.jsx`. Never an id hardcoded in a page, a picker or the API.
- **The database path comes from `DB_PATH`,** read when the database opens. Nothing may hardcode `./db/visitors.sqlite` except the fallback in `db/db.js`.
- **The container runs as `bun` (uid 1000).** Directories it writes to must be owned by 1000:1000; the image creates `storage`, `data/times` and `db-data` so a named volume inherits the right owner.
- **The live site is `waktusolat.me`.** Deploys come from `main`, never from a local build.

### Branches here (a deliberate deviation)

The shared block says `development` and `master`, with no `main`, `dev` or `staging`. This repo is older and keeps a three-rung ladder, because the site is public and a bad deploy is visible to everyone:

- `development` — integration. Every PR targets it.
- `staging` — a staging image (`:staging`) for checking a release before it is live.
- `main` — production. A push publishes `:latest` and redeploys.

`main` here is what the shared block calls `master`; there is no `master` branch. Don't create one.

### Open deviation to resolve

`tasks/` holds `todo.md`, `plan.md` and per-feature todo lists. The shared block says plans and TODO lists do not live in a repo. They are still tracked; moving them to the owner's vault is a decision for the owner, not for an agent to take mid-task.
