import type { ProjectDto } from '@riff/shared';
import { statusLabel, statusProgress } from '../../lib/status';
import styles from './StageStatus.module.css';

interface Props {
  project: ProjectDto;
}

export function StageStatus({ project }: Props) {
  const label = statusLabel(project.status);
  const tail = project.logTail.slice(-8);
  return (
    <div className={styles.status}>
      <div className={styles.label} aria-live="polite">
        {label}
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={statusProgress(project.status)}
      >
        <div className={styles.fill} style={{ width: `${statusProgress(project.status)}%` }} />
      </div>
      {tail.length > 0 && <pre className={styles.log}>{tail.join('\n')}</pre>}
    </div>
  );
}
