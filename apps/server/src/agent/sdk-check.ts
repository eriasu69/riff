// Compile-time check of the Agent SDK surface Riff relies on. Never imported at runtime.
import {
  query,
  type CanUseTool,
  type Options,
  type PermissionResult,
  type Query,
  type SDKMessage,
  type SDKUserMessage,
} from '@anthropic-ai/claude-agent-sdk';

const canUseTool: CanUseTool = async (toolName, input, { signal }): Promise<PermissionResult> => {
  if (signal.aborted) return { behavior: 'deny', message: 'aborted', interrupt: true };
  if (toolName !== 'Bash') return { behavior: 'allow', updatedInput: input };
  const command = String(input['command'] ?? '');
  if (command.includes('..')) return { behavior: 'deny', message: 'Outside workspace' };
  return { behavior: 'allow', updatedInput: input };
};

export const sdkCheckOptions = {
  cwd: 'C:/workspaces/example',
  systemPrompt: { type: 'preset', preset: 'claude_code', append: 'vibe brief' },
  resume: 'session-id',
  permissionMode: 'acceptEdits',
  allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'TodoWrite'],
  abortController: new AbortController(),
  canUseTool,
  settingSources: ['project'],
  includePartialMessages: true,
  env: { ...process.env },
  model: 'claude-sonnet-5',
  pathToClaudeCodeExecutable: undefined,
  executable: 'node',
} satisfies Options;

export function sdkCheckImagePrompt(sessionId: string, base64: string): AsyncIterable<SDKUserMessage> {
  async function* gen(): AsyncGenerator<SDKUserMessage> {
    yield {
      type: 'user',
      parent_tool_use_id: null,
      message: {
        role: 'user',
        content: [
          { type: 'text', text: 'Match this screenshot' },
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
        ],
      },
    };
  }
  return gen();
}

export async function sdkCheckRun(): Promise<string | undefined> {
  const q: Query = query({ prompt: 'hello', options: sdkCheckOptions });
  let sessionId: string | undefined;
  for await (const msg of q) sessionId = describe(msg) ?? sessionId;
  return sessionId;
}

// Switch over SDKMessage['type'] — returns session id when seen.
export function describe(msg: SDKMessage): string | undefined {
  switch (msg.type) {
    case 'system':
      if (msg.subtype === 'init') return msg.session_id;
      return undefined;
    case 'assistant':
      for (const block of msg.message.content) {
        if (block.type === 'text') void block.text;
        else if (block.type === 'tool_use') void [block.id, block.name, block.input];
      }
      return undefined;
    case 'user':
      return undefined;
    case 'stream_event':
      void msg.event.type;
      return undefined;
    case 'result':
      void [msg.subtype, msg.total_cost_usd, msg.duration_ms, msg.num_turns, msg.is_error];
      if (msg.subtype === 'success') void msg.result;
      return undefined;
    default:
      return undefined;
  }
}
