import { useId } from 'react';
import styles from './VibeSlider.module.css';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}

export function VibeSlider({ label, value, onChange, low, high }: Props) {
  const id = useId();
  return (
    <div className={styles.slider}>
      <label htmlFor={id} className={styles.label}>
        <span>{label}</span>
        <span className={styles.value}>{value}</span>
      </label>
      <input
        id={id}
        className={styles.range}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={styles.ends}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
