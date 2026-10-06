import { Chip } from '../ui/Chip';
import styles from './UserBubble.module.css';

interface Props {
  text: string;
  mention?: string;
}

export function UserBubble({ text, mention }: Props) {
  return (
    <div className={styles.wrap}>
      {mention && <Chip tone="mention">{mention}</Chip>}
      <div className={styles.bubble}>{text}</div>
    </div>
  );
}
