import type { ProjectDto } from '@riff/shared';
import { statusLabel, statusTone } from '../../lib/status';
import styles from './UrlBar.module.css';

interface Props {
  project: ProjectDto | null;
}

export function UrlBar({ project }: Props) {
  const tone = project ? statusTone(project.status) : 'idle';
  return (
    <div className={styles.bar}>
      <span className={`${styles.dot} ${styles[tone]}`} role="img" aria-label={project ? statusLabel(project.status) : 'No project'} />
      {project ? (
        <>
          {project.id}.riff.app<span className={styles.path}>/</span>
        </>
      ) : (
        <span className={styles.path}>no project</span>
      )}
    </div>
  );
}
