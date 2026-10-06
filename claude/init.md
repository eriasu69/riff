# Build "Riff": a local vibecoding studio

You're building Riff, a web app where I describe an app in chat and Claude Code builds it while I watch a live preview. The design has two screens, Studio and Ship. Build it in the phases below. Stop after each phase so I can run it and check it.

## Stack
- pnpm monorepo with two packages:
  - `apps/studio`: Vite + React + TypeScript (the Riff UI)
  - `apps/server`: Node + TypeScript (Hono or Fastify) plus WebSockets
- Claude Code integration: `@anthropic-ai/claude-agent-sdk` (`query()`), running on the server only. Read `ANTHROPIC_API_KEY` from `.env`. Never send the key to the browser.
- Each project the user builds is a real folder: `workspaces/<project-slug>/`. Every one is a git repo with a Vite + React template.
- Fonts: Geist and Geist Mono.

## Design tokens (dark theme, match exactly)
- Background colors: ground `#0B0C0F`, panel `#0E1013`, surface `#16181D`, raised `#1E2128`
- Borders: `#22252C`, strong `#2C3038`
- Text: `#ECEDEF`, secondary `#C3C7CE`, muted `#9BA1AC`, faint `#7D8490`
- Accent (lime): `#C8F135`. Text on the accent is `#0B0C0F`. Accent tint: background `#1A2008`, border `#3A4A12`, text `#DDF58C`.
- Status colors: success `#8FE388`, warning `#FFC46B`, removed lines `#FF8F8F`
- Radii: 8–14px. Every touch target is at least 44px. Icons are inline stroke SVGs. No emoji, no gradients.
- Small section labels: Geist Mono, 11px, uppercase, 0.08em letter-spacing, faint color.

## Studio layout
A three-column layout using flex-wrap so it stacks on narrow screens.

**Top bar**
- Riff logo and the `owner / project` name with a `main` branch chip.
- A Sketch / Build / Polish segmented switch in the center.
- Collaborator avatars, a Share button, and a lime "Ship it" button.

**Left: Chat (about 400px wide)**
- A streaming conversation with Claude Code.
- User messages are right-aligned bubbles.
- Claude's turns show:
  - the text it writes
  - a live plan checklist built from its TodoWrite tool calls
  - collapsible tool activity ("Edited src/App.tsx", "Ran pnpm test")
  - a diff chip ("+38 −21 · 3 files") with Compare and Undo buttons
- While Claude works, show a "Riffing on…" bar naming the file it is currently editing, plus a Stop button.
- The composer at the bottom has:
  - context chips (`@Component` from the preview picker, attached images)
  - a text area
  - attach and mic buttons
  - a send button; ⌘↵ also sends
  - `/` opens slash commands: /undo, /test, /fix, /explain

**Center: Preview**
- A URL bar with a green "live" dot.
- Phone (340px), Tablet (620px) and Web (100%) buttons.
- A "Point & riff" toggle.
- An iframe of the project's dev server on a dotted-grid stage.
- A Versions timeline along the bottom, with one chip per version.

**Right: Vibe panel (about 300px wide)**
- A headline that sums up the three sliders, e.g. "Playful, airy, polished."
- Three sliders from 0 to 100:
  - Mood: Calm ↔ Playful
  - Density: Airy ↔ Packed
  - Craft: Ship fast ↔ Polish
- A "Re-riff with this vibe" button.
- Stack chips, read from the project's package.json.
- A Health list (Build, Tests, Accessibility, Works offline) with a "Fix the issues for me" button.

## Claude Code integration (the core)
Server: `POST /api/projects/:id/turn` and a WebSocket at `/ws/projects/:id`.

1. Call `query({ prompt, options })` with these options:
   - `cwd`: the project's workspace folder
   - `systemPrompt`: `{ type: "preset", preset: "claude_code", append: vibeBrief }`
   - `resume`: the saved session id, so every turn continues the same conversation
   - `permissionMode: "acceptEdits"`
   - `allowedTools`: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
   - `abortController`: wired to the Stop button
2. Read the `session_id` from the first `system` init message and save it with the project in a JSON file or SQLite.
3. Stream every SDK message to the client over the WebSocket. Map each one to a UI event:
   - assistant text → chat text
   - `tool_use` → activity row
   - TodoWrite → plan checklist
   - `result` → turn complete, including cost and duration
4. `vibeBrief` is a short paragraph built from:
   - the three slider values, e.g. "Mood 68/100 → playful but not silly"
   - the mode:
     - Sketch: quick, it's fine to stub things
     - Build: working features with tests
     - Polish: visual refinement, accessibility, edge cases
   - always: "Keep the dev server working. Prefer small, focused commits of change."
5. Bash safety: use a `canUseTool` callback that blocks commands outside the workspace, `rm -rf` on anything except `node_modules` or `dist`, and any network installs except pnpm.
6. Images attached in the composer go to `query()` as image content blocks.

## Versions
- After each completed turn, run `git add -A && git commit` in the workspace. Use a 2–4 word summary as the message, either generated or taken from Claude's last text.
- Each commit becomes one chip on the timeline.
- Clicking a chip checks out that commit in a read-only preview worktree.
- "Restore" resets main to that commit.
- The diff chip in the chat comes from `git diff --shortstat` on that commit.
- Undo means `git revert` of the last turn's commit.

## Preview
- The server starts `pnpm dev` for each workspace on a free port and proxies it at `/preview/:id/`.
- If the dev server crashes, show the error in the stage with a "Send to Claude" button, which prefills `/fix` with the stack trace.
- Point & riff: inject a small script into the preview through a Vite plugin in the template. With the toggle on, hovering outlines elements and shows the React component name, taken from `_debugSource` or a `data-riff` attribute that a Babel plugin adds. Clicking sends `{component, file, line}` to the parent with postMessage, which adds an `@Component` chip to the composer and includes the file path in the prompt context.

## Health
After each turn, run these in the background and fill in the Health panel:
- `tsc --noEmit`
- `pnpm test --run`
- `axe-core` through Playwright against the preview
- a manifest and service-worker check for "Works offline"

"Fix the issues for me" sends the failures to Claude as a turn.

## Ship sheet (Phase 4; a modal over Studio)
- Preflight checklist: build and tests, a secret scan of the client bundle, accessibility issues with Auto-fix, PWA score.
- An address input shown as `https://[slug].riff.app` (stub this, or use a real deploy target I choose later).
- Visibility options: Anyone, Team, or Password.
- An "Also push to a new GitHub repo" checkbox (uses the `gh` CLI).
- Buttons: "Keep riffing" and "Ship vN".

## Phases
1. **Skeleton:** monorepo, design tokens, the static Studio layout with all three columns, and the project create flow (copies the template, runs `git init`, installs, starts the dev server, loads the iframe).
2. **Claude Code chat:** Agent SDK streaming over the WebSocket, session resume, Stop, the plan checklist, tool activity, and the vibe brief.
3. **Versions + Point & riff:** git commit per turn, the timeline, undo/restore, and the component picker.
4. **Health + Ship.**

Before you write any code, confirm the Agent SDK's current `query()` options and message types in the installed package's types, and adjust if anything differs from this spec. Then start Phase 1.