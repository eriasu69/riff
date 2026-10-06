# Agent SDK notes (`@anthropic-ai/claude-agent-sdk` 0.3.289)

Verified against installed `sdk.d.ts`; compiled check in `src/agent/sdk-check.ts`.

| Spec | Actual | Status |
|---|---|---|
| `query({prompt, options})` | `query(params: {prompt: string \| AsyncIterable<SDKUserMessage>; options?: Options}): Query` (Query is an `AsyncGenerator<SDKMessage>` + `interrupt()`, `close()`, ...) | OK |
| `cwd` | `cwd?: string` | OK |
| `systemPrompt` preset+append | `{type:'preset'; preset:'claude_code'; append?: string; excludeDynamicSections?: boolean}` (also `string`, `string[]`, `{type:'custom'}`) | OK |
| `resume` | `resume?: string` (session id) | OK |
| `permissionMode: 'acceptEdits'` | `'default'\|'acceptEdits'\|'bypassPermissions'\|'plan'\|'dontAsk'\|'auto'` | OK |
| `allowedTools` | `string[]` - auto-allow list only, NOT a restriction. Restrict with `tools: string[]` or `disallowedTools` | Semantics differ |
| `abortController` | `abortController?: AbortController` (also `query.interrupt()` / `close()`) | OK |
| `canUseTool` | `(toolName: string, input: Record<string, unknown>, opts: {signal: AbortSignal; suggestions?; blockedPath?; decisionReason?; ...}) => Promise<PermissionResult>` | OK |
| PermissionResult | `{behavior:'allow'; updatedInput?; updatedPermissions?}` \| `{behavior:'deny'; message: string; interrupt?: boolean}` | OK (`updatedInput` optional now) |
| `settingSources` | `Array<'user'\|'project'\|'local'>`; omitted = all loaded; `[]` = isolation | OK; see deviation 2 |
| `includePartialMessages` | `boolean` -> emits `type:'stream_event'` with `event: BetaRawMessageStreamEvent` | OK |
| `env` | `{[k]: string\|undefined}` REPLACES process env (spread `process.env`) | note |
| `model`, `pathToClaudeCodeExecutable`, `executable: 'bun'\|'deno'\|'node'`, `maxTurns`, `maxBudgetUsd`, `persistSession`, `stderr`, `hooks`, `sandbox` | present | - |

## Messages (`SDKMessage` union, discriminated on `type`)
- `system` + `subtype:'init'`: `session_id`, `model`, `cwd`, `tools: string[]`, `permissionMode`, `apiKeySource`. Many other `system` subtypes exist (status, api_retry, permission_denied, task_*, hook_*) - always narrow on `subtype`.
- `assistant`: `message: BetaMessage` (`message.content[]` blocks: `text{text}`, `thinking`, `tool_use{id,name,input}`), `parent_tool_use_id` (non-null = subagent), `session_id`, `uuid`.
- `user`: tool results arrive as `user` messages with `message.content` = `tool_result` blocks (`tool_use_id`, `content`, `is_error`); also `tool_use_result` (structured).
- `stream_event`: partial deltas (only with `includePartialMessages`).
- `result`: `subtype: 'success' | 'error_during_execution' | 'error_max_turns' | 'error_max_budget_usd' | 'error_max_structured_output_retries'`; `total_cost_usd`, `duration_ms`, `duration_api_ms`, `num_turns`, `is_error`, `session_id`, `usage`, `permission_denials`. `result: string` only on success; `errors: string[]` on error variants.
- Every message carries `session_id`.

## Images
Prompt must be `AsyncIterable<SDKUserMessage>`: `{type:'user', parent_tool_use_id:null, message:{role:'user', content:[{type:'text',text},{type:'image',source:{type:'base64',media_type:'image/png',data}}]}}`. (`SDKUserMessage.session_id` is optional/absent in this version; not required.) See `sdkCheckImagePrompt`. With streaming-input the generator must stay open until the `result` arrives (ending the generator closes stdin); for one turn per query, yield once and let it finish after result is received, or `await` a promise resolved on result before returning.

## TodoWrite
Still `TodoWrite`. Input (`sdk-tools.d.ts`): `{todos: {content: string; status: 'pending'|'in_progress'|'completed'; activeForm: string}[]}`. Other tool inputs: `Bash {command, timeout?, ...}`, `Edit {file_path, old_string, new_string}`, `Write {file_path, content}`, `Read {file_path, offset?, limit?}`.

## Binary
No separate Claude Code install needed: the native CLI ships as optional dep `@anthropic-ai/claude-agent-sdk-win32-x64` (claude.exe) which pnpm installs per platform. Override with `pathToClaudeCodeExecutable`. Auth: inherits `ANTHROPIC_API_KEY` from env (or local `claude /login` OAuth if no key; `apiKeySource` in init tells which). Server must load `.env` into `process.env` before calling `query` (or pass `env`).

## Deviations / decisions for Phase 2
1. `allowedTools` only pre-approves; to hard-limit tools use `tools: ['Read','Write','Edit','Glob','Grep','Bash','TodoWrite']` too (native builds may lack dedicated Grep/Glob unless listed). Spec list is still valid.
2. `settingSources` omitted loads user+project+local (user's global `~/.claude` CLAUDE.md/hooks leak into Riff sessions). Pass `['project']` for the workspace (loads workspace CLAUDE.md) or `[]` for full isolation.
3. `permissionMode: 'acceptEdits'` auto-allows edits only; Bash still goes through `canUseTool` (unless covered by `allowedTools`: **listing `Bash` in `allowedTools` makes it pre-approved, so `canUseTool` will NOT be called for Bash**). To enforce Bash safety, do NOT put `Bash` in `allowedTools` (leave it to `canUseTool`) or use a `PreToolUse` hook (`hooks`) which always runs. Verify at runtime in Phase 2.
4. `resume` requires session files in `~/.claude/projects` (`persistSession` default true); sessions are keyed by cwd, so keep cwd stable per project.
5. `Query.interrupt()` is the graceful Stop; `abortController.abort()` also works and throws `AbortError` from the iterator - catch it.
6. `result` cost is cumulative across turns for streaming-input sessions; per-`query()` otherwise.
