import { autoSavedLabel, versions } from '../../mock/session';
import { useStudioStore } from '../../state/studioStore';
import { SectionLabel } from '../ui/SectionLabel';
import styles from './VersionsTimeline.module.css';

export function VersionsTimeline() {
  const selected = useStudioStore((s) => s.selectedVersion);
  const selectVersion = useStudioStore((s) => s.selectVersion);
  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <SectionLabel>Versions — click to rewind</SectionLabel>
        <span className={styles.saved}>{autoSavedLabel}</span>
      </div>
      <ol className={styles.list}>
        {versions.map((version) => (
          <li key={version.id} className={styles.item}>
            <button
              type="button"
              className={styles.version}
              aria-current={version.id === selected}
              onClick={() => selectVersion(version.id)}
            >
              <span className={styles.tag}>{version.id}</span>
              <span className={styles.name}>{version.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
