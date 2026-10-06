import type { ProjectDto } from '@riff/shared';
import { isCrashed } from '../../lib/status';
import { cx } from '../../lib/cx';
import { useStudioStore } from '../../state/studioStore';
import { CrashCard } from './CrashCard';
import { StageStatus } from './StageStatus';
import styles from './Stage.module.css';

interface Props {
  project: ProjectDto | null;
  onRestart: () => Promise<void>;
}

function StageContent({ project, onRestart }: Props) {
  if (!project) return <div className={styles.placeholder}>Loading project…</div>;
  if (project.status === 'running') return <iframe className={styles.iframe} src={project.previewUrl} title="App preview" />;
  if (isCrashed(project.status)) return <CrashCard project={project} onRestart={onRestart} />;
  return <StageStatus project={project} />;
}

export function Stage({ project, onRestart }: Props) {
  const device = useStudioStore((s) => s.device);
  const inspect = useStudioStore((s) => s.inspect);
  return (
    <div className={styles.stage}>
      <div className={cx(styles.frame, styles[device], inspect && styles.inspecting)}>
        <StageContent project={project} onRestart={onRestart} />
      </div>
    </div>
  );
}
