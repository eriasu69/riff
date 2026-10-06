import type { PlanItem } from '../../mock/session';
import { CheckIcon, DashedCircleIcon } from '../icons';
import styles from './PlanChecklist.module.css';

interface Props {
  items: PlanItem[];
}

export function PlanChecklist({ items }: Props) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.label} className={item.done ? styles.done : styles.pending}>
          {item.done ? <CheckIcon size={14} /> : <DashedCircleIcon size={14} />}
          <span className="visually-hidden">{item.done ? 'Done: ' : 'To do: '}</span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
