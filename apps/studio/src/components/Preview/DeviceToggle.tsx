import { useStudioStore, type Device } from '../../state/studioStore';
import { Segmented } from '../ui/Segmented';

const DEVICES: readonly { id: Device; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'web', label: 'Web' },
];

export function DeviceToggle() {
  const device = useStudioStore((s) => s.device);
  const setDevice = useStudioStore((s) => s.setDevice);
  return <Segmented label="Preview size" options={DEVICES} value={device} onChange={setDevice} />;
}
