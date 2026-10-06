import { useRef, useState, type KeyboardEvent } from 'react';
import { composerContext } from '../../mock/session';
import { AttachIcon, MicIcon, SendIcon } from '../icons';
import { Chip } from '../ui/Chip';
import styles from './Composer.module.css';

const COMMANDS = ['/undo', '/test', '/fix', '/explain'] as const;

const matchingCommands = (value: string) => {
  if (!/^\/\S*$/.test(value)) return [];
  return COMMANDS.filter((command) => command.startsWith(value));
};

export function Composer() {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commands = matchingCommands(value);

  const send = () => setValue('');

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    send();
  };

  const insertCommand = (command: string) => {
    setValue(`${command} `);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.context}>
          {composerContext.map((item) => (
            <Chip key={item.label} tone={item.tone}>
              {item.label}
            </Chip>
          ))}
        </div>
        <label htmlFor="riff-prompt" className="visually-hidden">
          Describe the change
        </label>
        <textarea
          id="riff-prompt"
          ref={inputRef}
          rows={2}
          className={styles.input}
          placeholder="Describe the vibe… or type / for commands"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {commands.length > 0 && (
          <ul className={styles.menu} aria-label="Commands">
            {commands.map((command) => (
              <li key={command}>
                <button type="button" className={styles.command} onClick={() => insertCommand(command)}>
                  {command}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.toolbar}>
          <button type="button" className={styles.iconButton} aria-label="Attach file">
            <AttachIcon />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Talk it through">
            <MicIcon />
          </button>
          <span className={styles.hint}>⌘↵</span>
          <button type="button" className={styles.send} aria-label="Send" onClick={send}>
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
