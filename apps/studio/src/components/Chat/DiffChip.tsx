import type { DiffStat } from '../../mock/session';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import styles from './DiffChip.module.css';

interface Props {
  diff: DiffStat;
  actions?: boolean;
}

export function DiffChip({ diff, actions }: Props) {
  return (
    <div className={styles.row}>
      <Chip tone="diff">
        <span className={styles.added}>+{diff.added}</span> <span className={styles.removed}>−{diff.removed}</span> · {diff.files}{' '}
        {diff.files === 1 ? 'file' : 'files'}
      </Chip>
      {actions && (
        <>
          <Button className={styles.action}>Compare</Button>
          <Button className={styles.action}>Undo</Button>
        </>
      )}
    </div>
  );
}
