import { vibeLine } from '../../lib/vibe';
import { useStudioStore } from '../../state/studioStore';
import { SectionLabel } from '../ui/SectionLabel';
import styles from './VibeHeadline.module.css';

export function VibeHeadline() {
  const mood = useStudioStore((s) => s.mood);
  const density = useStudioStore((s) => s.density);
  const craft = useStudioStore((s) => s.craft);
  return (
    <div className={styles.wrap}>
      <SectionLabel>Vibe</SectionLabel>
      <div className={styles.line}>{vibeLine(mood, density, craft)}</div>
    </div>
  );
}
