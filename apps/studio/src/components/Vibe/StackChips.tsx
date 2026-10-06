import { Chip } from '../ui/Chip';
import { SectionLabel } from '../ui/SectionLabel';
import { Button } from '../ui/Button';
import styles from './StackChips.module.css';

interface Props {
  stack: string[];
}

export function StackChips({ stack }: Props) {
  return (
    <div className={styles.wrap}>
      <SectionLabel>Stack</SectionLabel>
      <div className={styles.chips}>
        {stack.map((item) => (
          <Chip key={item} tone="pill">
            {item}
          </Chip>
        ))}
        <Button className={styles.add}>+ add</Button>
      </div>
    </div>
  );
}
