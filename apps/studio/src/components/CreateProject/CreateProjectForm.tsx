import { useId, useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import styles from './CreateProjectForm.module.css';

interface Props {
  onCreate: (name: string) => Promise<void>;
}

export function CreateProjectForm({ onCreate }: Props) {
  const inputId = useId();
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    try {
      await onCreate(trimmed);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the project.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={inputId} className={styles.label}>
        Project name
      </label>
      <input
        id={inputId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Pocket Plants"
        autoComplete="off"
        autoFocus
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending || !name.trim()}>
        {pending ? 'Creating…' : 'Create project'}
      </Button>
    </form>
  );
}
