import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'tint';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'ghost', className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cx(styles.button, styles[variant], className)} {...rest} />;
}
