import type { ChatMessage } from '../../mock/session';
import { DiffChip } from './DiffChip';
import { PlanChecklist } from './PlanChecklist';
import styles from './ClaudeTurn.module.css';

interface Props {
  message: ChatMessage;
}

export function ClaudeTurn({ message }: Props) {
  return (
    <div className={styles.turn}>
      <div className={styles.header}>
        <span className={styles.dot} />
        Riff
      </div>
      <div className={styles.text}>{message.text}</div>
      {message.plan && <PlanChecklist items={message.plan} />}
      {message.diff && <DiffChip diff={message.diff} actions={message.undoable} />}
    </div>
  );
}
