import { useState } from 'react';
import type { ProjectDto } from '@riff/shared';
import { statusLabel } from '../../lib/status';
import { Button } from '../ui/Button';
import styles from './CrashCard.module.css';

interface Props {
  project: ProjectDto;
  onRestart: () => Promise<void>;
}

export function CrashCard({ project, onRestart }: Props) {
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState<string | null>(null);

  const restart = async () => {
    setRestarting(true);
    setRestartError(null);
    try {
      await onRestart();
    } catch (err) {
      setRestartError(err instanceof Error ? err.message : 'Restart failed.');
    } finally {
      setRestarting(false);
    }
  };

  const tail = project.logTail.slice(-20);
  const message = restartError ?? project.error;

  return (
    <div className={styles.card} role="alert">
      <h2 className={styles.title}>{statusLabel(project.status)}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {tail.length > 0 && <pre className={styles.log}>{tail.join('\n')}</pre>}
      <div className={styles.actions}>
        <Button variant="primary" onClick={restart} disabled={restarting}>
          {restarting ? 'Restarting…' : 'Restart'}
        </Button>
        <Button disabled title="Available in Phase 2">
          Send to Claude
        </Button>
      </div>
    </div>
  );
}
