import { riffing } from '../../mock/session';
import styles from './RiffingBar.module.css';

export function RiffingBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <span>{riffing.title}</span>
        <span className={styles.file}>{riffing.file}</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={riffing.title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={riffing.progress}
      >
        <div className={styles.fill} style={{ width: `${riffing.progress}%` }} />
      </div>
    </div>
  );
}
