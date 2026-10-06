import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { CreateProjectForm } from './CreateProjectForm';
import styles from './CreateProjectDialog.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateProjectDialog({ open, onClose, onCreate }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const create = async (name: string) => {
    await onCreate(name);
    onClose();
  };

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="new-project-title" onClose={onClose}>
      {open && (
        <div className={styles.content}>
          <h2 id="new-project-title" className={styles.title}>
            New project
          </h2>
          <CreateProjectForm onCreate={create} />
          <Button onClick={onClose}>Cancel</Button>
        </div>
      )}
    </dialog>
  );
}
