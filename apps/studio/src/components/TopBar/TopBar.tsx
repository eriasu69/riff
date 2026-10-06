import type { ProjectDto } from '@riff/shared';
import { useStudioStore, type Mode } from '../../state/studioStore';
import { ArrowUpIcon, WaveIcon } from '../icons';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { ProjectPill } from './ProjectPill';
import styles from './TopBar.module.css';

const MODES: readonly { id: Mode; label: string }[] = [
  { id: 'sketch', label: 'Sketch' },
  { id: 'build', label: 'Build' },
  { id: 'polish', label: 'Polish' },
];

interface Props {
  projects: ProjectDto[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

export function TopBar({ projects, onSelectProject, onNewProject }: Props) {
  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);
  const projectId = useStudioStore((s) => s.projectId);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <WaveIcon />
        </div>
        <span className={styles.wordmark}>riff</span>
      </div>

      <ProjectPill projects={projects} projectId={projectId} onSelect={onSelectProject} onNew={onNewProject} />

      <Segmented label="Vibe mode" tone="accent" options={MODES} value={mode} onChange={setMode} className={styles.modes} />

      <div className={styles.actions}>
        <div className={styles.avatars} aria-label="Collaborators">
          <span className={styles.avatar} style={{ background: 'var(--avatar-1)' }}>
            EB
          </span>
          <span className={styles.avatar} style={{ background: 'var(--avatar-2)', marginLeft: -8 }}>
            MK
          </span>
        </div>
        <Button>Share</Button>
        <Button variant="primary">
          <ArrowUpIcon size={16} />
          Ship it
        </Button>
      </div>
    </header>
  );
}
