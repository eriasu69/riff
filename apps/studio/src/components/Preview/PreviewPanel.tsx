import type { ProjectDto } from '@riff/shared';
import { DeviceToggle } from './DeviceToggle';
import { InspectToggle } from './InspectToggle';
import { Stage } from './Stage';
import { UrlBar } from './UrlBar';
import { VersionsTimeline } from './VersionsTimeline';
import styles from './PreviewPanel.module.css';

interface Props {
  project: ProjectDto | null;
  onRestart: () => Promise<void>;
}

export function PreviewPanel({ project, onRestart }: Props) {
  return (
    <main className={styles.panel}>
      <div className={styles.toolbar}>
        <UrlBar project={project} />
        <DeviceToggle />
        <InspectToggle />
      </div>
      <Stage project={project} onRestart={onRestart} />
      <VersionsTimeline />
    </main>
  );
}
