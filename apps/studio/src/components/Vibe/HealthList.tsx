import { health } from '../../mock/session';
import { cx } from '../../lib/cx';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import styles from './HealthList.module.css';

export function HealthList() {
  return (
    <div className={styles.wrap}>
      <SectionLabel>Health</SectionLabel>
      <dl className={styles.list}>
        {health.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>{row.label}</dt>
            <dd className={cx(styles[row.tone], row.mono && styles.mono)}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <Button className={styles.fix}>Fix the 2 issues for me</Button>
    </div>
  );
}
