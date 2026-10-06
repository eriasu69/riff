import { useEffect, useState } from 'react';
import { createProject } from './api/client';
import { useProjectSocket } from './api/useProjectSocket';
import { ChatPanel } from './components/Chat/ChatPanel';
import { CreateProjectDialog } from './components/CreateProject/CreateProjectDialog';
import { EmptyState } from './components/CreateProject/EmptyState';
import { PreviewPanel } from './components/Preview/PreviewPanel';
import { TopBar } from './components/TopBar/TopBar';
import { Button } from './components/ui/Button';
import { VibePanel } from './components/Vibe/VibePanel';
import { useStudioStore } from './state/studioStore';
import { useProjects } from './state/useProjects';
import styles from './App.module.css';

export function App() {
  const { projects, loading, error, add, reload } = useProjects();
  const projectId = useStudioStore((s) => s.projectId);
  const setProjectId = useStudioStore((s) => s.setProjectId);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Keep the selection valid: stored id if it still exists, else the first project.
  useEffect(() => {
    if (loading || projects.length === 0) return;
    if (projects.some((p) => p.id === projectId)) return;
    setProjectId(projects[0].id);
  }, [loading, projects, projectId, setProjectId]);

  const { project, restart } = useProjectSocket(projects.some((p) => p.id === projectId) ? projectId : null);

  const create = async (name: string) => {
    const created = await createProject(name);
    add(created);
    setProjectId(created.id);
  };

  const renderBody = () => {
    if (loading) return <p className={styles.message}>Loading…</p>;
    if (error) {
      return (
        <div className={styles.message} role="alert">
          <p>Can’t reach the Riff server. {error}</p>
          <Button onClick={reload}>Try again</Button>
        </div>
      );
    }
    if (projects.length === 0) return <EmptyState onCreate={create} />;
    return (
      <div className={styles.body}>
        <ChatPanel />
        <PreviewPanel project={project} onRestart={restart} />
        <VibePanel project={project} />
      </div>
    );
  };

  return (
    <div className={styles.shell}>
      <TopBar projects={projects} onSelectProject={setProjectId} onNewProject={() => setDialogOpen(true)} />
      {renderBody()}
      <CreateProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={create} />
    </div>
  );
}
