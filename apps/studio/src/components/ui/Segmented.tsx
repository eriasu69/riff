import { cx } from '../../lib/cx';
import styles from './Segmented.module.css';

interface Option<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** accent: lime active segment (mode switch); neutral: grey active segment (device toggle). */
  tone?: 'accent' | 'neutral';
  className?: string;
}

export function Segmented<T extends string>({ label, options, value, onChange, tone = 'neutral', className }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={cx(styles.group, styles[tone], className)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={option.id === value}
          className={styles.segment}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
