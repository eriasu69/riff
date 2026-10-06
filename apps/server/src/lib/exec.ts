import { spawn } from 'node:child_process';

export interface RunOptions {
  cwd: string;
  onLine?: (line: string) => void;
}

const TAIL_LINES = 30;

export const pipeLines = (stream: NodeJS.ReadableStream, onLine: (line: string) => void) => {
  let buffer = '';
  stream.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? '';
    parts.filter((l) => l.length > 0).forEach(onLine);
  });
  stream.on('end', () => {
    if (buffer.length > 0) onLine(buffer);
  });
};

export const runCommand = (cmd: string, args: string[], { cwd, onLine }: RunOptions) =>
  new Promise<void>((resolve, reject) => {
    const tail: string[] = [];
    const handle = (line: string) => {
      tail.push(line);
      if (tail.length > TAIL_LINES) tail.shift();
      onLine?.(line);
    };
    const child = spawn(cmd, args, {
      cwd,
      shell: process.platform === 'win32',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    pipeLines(child.stdout, handle);
    pipeLines(child.stderr, handle);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}\n${tail.join('\n')}`));
    });
  });
