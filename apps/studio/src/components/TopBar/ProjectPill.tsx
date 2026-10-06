import { useEffect, useRef, useState } from 'react';
import type { ProjectDto } from '@riff/shared';
import { ChevronDownIcon } from '../icons';
import { Chip } from '../ui/Chip';
import styles from './ProjectPill.module.css';

interface Props {
  projects: ProjectDto[];
  projectId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ProjectPill({ projects, projectId, onSelect, onNew }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.pill}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.owner}>elias /</span>
        <span>{projectId ?? 'no project'}</span>
        <Chip tone="branch">main</Chip>
        <ChevronDownIcon size={14} />
      </button>
      {open && (
        <div role="menu" aria-label="Projects" className={styles.menu}>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              role="menuitem"
              className={styles.item}
              aria-current={project.id === projectId}
              onClick={() => choose(() => onSelect(project.id))}
            >
              {project.name}
              <span className={styles.slug}>{project.id}</span>
            </button>
          ))}
          <button type="button" role="menuitem" className={styles.item} onClick={() => choose(onNew)}>
            + New project
          </button>
        </div>
      )}
    </div>
  );
}
