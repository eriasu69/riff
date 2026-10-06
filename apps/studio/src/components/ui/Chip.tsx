import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Chip.module.css';

export type ChipTone = 'branch' | 'mention' | 'file' | 'diff' | 'pill' | 'pillDashed';

interface Props {
  tone: ChipTone;
  children: ReactNode;
  className?: string;
}

export function Chip({ tone, children, className }: Props) {
  return <span className={cx(styles.chip, styles[tone], className)}>{children}</span>;
}
