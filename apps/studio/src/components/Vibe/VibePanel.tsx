import type { ProjectDto } from '@riff/shared';
import { useStudioStore } from '../../state/studioStore';
import { Button } from '../ui/Button';
import { HealthList } from './HealthList';
import { StackChips } from './StackChips';
import { VibeHeadline } from './VibeHeadline';
import { VibeSlider } from './VibeSlider';
import styles from './VibePanel.module.css';

interface Props {
  project: ProjectDto | null;
}

export function VibePanel({ project }: Props) {
  const { mood, density, craft, setMood, setDensity, setCraft } = useStudioStore();
  return (
    <aside aria-label="Vibe controls" className={styles.panel}>
      <VibeHeadline />
      <div className={styles.dials}>
        <VibeSlider label="Mood" value={mood} onChange={setMood} low="Calm" high="Playful" />
        <VibeSlider label="Density" value={density} onChange={setDensity} low="Airy" high="Packed" />
        <VibeSlider label="Craft" value={craft} onChange={setCraft} low="Ship fast" high="Polish" />
        <Button variant="tint">Re-riff with this vibe</Button>
      </div>
      <StackChips stack={project?.stack ?? []} />
      <HealthList />
    </aside>
  );
}
