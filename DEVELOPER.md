# Developing waktusolat.me

A public prayer-times site for Malaysia: an Elysia server, a React + Vite client, and SQLite for the things that change (visitors, mosques, programmes, photos). Agents get the same rules in [AGENTS.md](AGENTS.md).

## Commands

Run from the repo root with [Bun](https://bun.sh).

| Task | Command |
| --- | --- |
| Install both packages | `bun run install-all` |
| Run server and client together | `bun run dev` |
| Run the server alone, reloading on change | `bun run server` |
| Run the client alone | `bun run client` |
| Refresh the JAKIM times cache | `bun run get-times` |
| Run the test suite | `bun run test` |
| Lint with Biome | `bun run lint` |
| Build the client | `bun run build-client` |
| Start in production | `bun run start` |

The client has its own lockfile and is installed separately; `install-all` does both.

## Layout

| Path | What lives there |
| --- | --- |
| `server.js` | The Elysia app: routes, GraphQL, socket.io, CORS, shutdown |
| `routes/api.js` | Every `/api/v1` route, including the healthcheck |
| `controllers/` | Zones, mosques, programmes, helpers — the data the routes serve |
| `db/db.js` | SQLite (`bun:sqlite`) and its migrations |
| `graphql/` | Apollo schema, resolvers, SDL |
| `shared/temas.js` | The tema registry, imported by both sides |
| `client/src/pages` | The site's pages |
| `client/src/web/layouts` | The printed page pool, one component per layout |
| `client/src/tv` | The TV boards, kiosk mode and the service worker |
| `client/src/mosque` | The mosque editor: registry, programmes, photos |
| `data/times` | Cached JAKIM prayer times, one file per zone |
| `scripts/` | Build-time checks (the contrast sweep, `contrast.mjs`) |

## Tests

`bun run test` runs `tests/` with `bun:test` — 267 tests across 29 files. Route tests import `tests/app.js` first: it pins `DB_PATH` to a temp SQLite file before the app loads, because `db/db.js` reads the path when the database opens and Bun shares the module cache across test files. A test that skips that harness will write to the real `./db/visitors.sqlite`.

`tests/row-state-vocabulary.test.js` is a guard rather than a unit test: it fails if a stylesheet keys off a row state that `rowStates` never emits (`past` instead of `passed` was live for months because every selector was dead).

## Linting

[Biome](https://biomejs.dev) 2.5.12 is pinned as a dev dependency and is the only linter. `bun run lint` runs `biome ci .` — lint, formatting and import order over 209 files. `lab/` is excluded: it holds the design drafts the temas were ported from, not shipped code. Markdown is not checked.

## Branches and releases

| Branch | Role |
| --- | --- |
| `development` | Integration. Branch from it (`feat/…`, `fix/…`, `chore/…`) and open every PR against it. |
| `staging` | A release candidate, published as `:staging` for checking before it is live. |
| `main` | Production. A push publishes `:latest` and the site redeploys. There is no `master`. |

The ez series uses `development` → `master`; this repo keeps a third rung because the site is public and a bad deploy is visible to everyone.

To release: bump `package.json`, move `[Unreleased]` in `CHANGELOG.md` under `## [x.y.z] - YYYY-MM-DD`, merge `development` → `staging`, check the staging image, then merge `staging` → `main` and tag `vX.Y.Z`. The repo has no tags yet; the first release should add one so the image version and the changelog agree.

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`fix(scope): …`) with a body that explains why. Anything a visitor would notice gets a `CHANGELOG.md` line.

## CI

- `test.yml` — on every PR to `development`, `staging` or `main`: frozen-lockfile install (root and client), `bun run lint`, `bun run test`, client build. Then a second job builds the image, boots it, waits for healthy, asserts `id -u` is 1000 and that the app creates its database on a `1000:1000` bind mount.
- `publish.yml` — on push to `development`, `staging`, `main` or a `vX.Y.Z` tag: runs `test.yml` first, then publishes `calypso666/waktusolat.me` — `development` gets `:development` and `:sha-<commit>` and does not deploy; `staging` gets `:staging` and `:sha-<commit>` and recreates the staging container; `main` gets `:latest`, `:<version>` and `:sha-<commit>` and recreates production; a tag must match `package.json`, publishes `:<version>` and writes a GitHub Release from the `CHANGELOG.md` section.
- `codeql-analysis.yml` — the scheduled security scan.

Staging has its own hostname (`staging.waktusolat.me`) and its own data (`~/own/waktusolat-staging/`), so a staging deploy touches only the staging container. Before 2026-11-26 both services claimed the same Traefik host rule and a staging deploy **stopped production**; that coupling is gone.

Bun is pinned at **1.4.5** in both `Dockerfile` stages and in `test.yml`. Keep them in step.

## Docker and state

The image is `oven/bun:1.4.5-alpine` in both stages. The build stage compiles the client; the runtime installs production dependencies with `--frozen-lockfile --omit=dev`, copies with `--chown=bun:bun`, and runs as **`bun` (uid 1000)**.

State is two bind mounts, both gitignored:

| Host | Container | Contents |
| --- | --- | --- |
| `./storage` | `/app/storage` | Visitor database (`DB_PATH=/app/storage/visitors.sqlite`) |
| `./data/times` | `/app/data/times` | Cached JAKIM times |

Both must be owned by **1000:1000**, or the app starts and then cannot open the database:

```bash
mkdir -p storage data/times && sudo chown -R 1000:1000 storage data/times
```

Production on the server mounts `./waktusolat/db` at `/app/db-data` and `./waktusolat/times` at `/app/data/times`, with `DB_PATH` pointing at `/app/db-data/visitors.sqlite`. Those host directories are already `1000:1000`.

After changing the `Dockerfile` or the Bun version, build and boot the image with a throwaway `DB_PATH` before pushing:

```bash
docker build -t waktusolat .
docker run --rm -p 5099:5000 -e DB_PATH=/tmp/visitors.sqlite waktusolat
```
