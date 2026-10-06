import { CreateProjectForm } from './CreateProjectForm';
import styles from './EmptyState.module.css';

interface Props {
  onCreate: (name: string) => Promise<void>;
}

export function EmptyState({ onCreate }: Props) {
  return (
    <main className={styles.wrap}>
      <section className={styles.card} aria-labelledby="empty-title">
        <h1 id="empty-title" className={styles.title}>
          Start your first project
        </h1>
        <p className={styles.hint}>Name it, then describe what to build. Riff sets up a live preview for you.</p>
        <CreateProjectForm onCreate={onCreate} />
      </section>
    </main>
  );
}
