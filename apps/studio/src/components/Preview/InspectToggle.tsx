import { useStudioStore } from '../../state/studioStore';
import { CursorIcon } from '../icons';
import { Button } from '../ui/Button';

export function InspectToggle() {
  const inspect = useStudioStore((s) => s.inspect);
  const toggleInspect = useStudioStore((s) => s.toggleInspect);
  return (
    <Button variant={inspect ? 'tint' : 'ghost'} aria-pressed={inspect} onClick={toggleInspect}>
      <CursorIcon size={16} />
      Point &amp; riff
    </Button>
  );
}
