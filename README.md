# kittylol

A small, stateless command router for the Chrome address bar, inspired by
[`bunnylol`](https://github.com/nelhage/bunnylol).

Commands support both homepage navigation and searches:

```text
g            -> https://google.com/
g red pandas -> https://google.com/search?q=red+pandas
gh dwang/kittylol
```

Unknown commands fall back to Google Search.

## Configure Chrome

1. Deploy the Worker and copy its public URL.
2. Open `chrome://settings/searchEngines`.
3. Add a search engine named `kittylol` whose URL is
   `https://<your-worker-host>/?q=%s`.
4. Use Chrome's menu for that entry to make it the default search engine.

Chrome will now send address-bar text to kittylol, which returns an HTTP 302 to
the configured destination.

## Commands

| Command | Homepage | Search |
| --- | --- | --- |
| `cal` | Google Calendar | — |
| `cf` | Cloudflare dashboard | — |
| `cs` | GitHub search | GitHub code search |
| `docker` | Docker Hub | Container image search |
| `drive` | Google Drive | Drive search |
| `g` | Google | Google Search |
| `gcp` | Google Cloud console | — |
| `gh` | GitHub | GitHub path, such as `owner/repo` |
| `gm` | Gmail | — |
| `gpt` | ChatGPT | ChatGPT query |
| `hn` | Hacker News | Algolia HN search |
| `ip` | Public IP address | — |
| `maps` | Google Maps | Maps search |
| `ts` | Tailscale machines | — |
| `yt` | YouTube | YouTube search |

Command definitions and their URL encoding strategies live in
[`src/commands.ts`](src/commands.ts).

## Sensitive values

Every query sent to kittylol passes through Cloudflare and may remain in browser
history. Do not send passwords, bearer tokens, or other secrets through the
Worker.

Automatic Cloudflare invocation logs are disabled in `wrangler.jsonc` so routine
request URLs are not written to Workers Logs.

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run check
npm run dev
```

Available scripts:

- `npm test` runs the test suite once.
- `npm run test:watch` starts Vitest in watch mode.
- `npm run typecheck` checks Worker and test TypeScript projects.
- `npm run check` runs type checking and tests.
- `npm run deploy` checks the project before deploying with Wrangler.

## Architecture

- `src/index.ts` is the HTTP adapter.
- `src/resolve.ts` parses commands and selects a destination.
- `src/commands.ts` contains typed commands and component-aware URL builders.

The Worker is deliberately stateless and requires no external storage or
server-side infrastructure.
