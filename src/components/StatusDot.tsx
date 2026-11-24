import type { Status } from '../store/progress';

const LABEL: Record<Status, string> = { todo: 'ยังไม่ทำ', tried: 'ลองแล้ว', solved: 'ผ่านแล้ว' };

export default function StatusDot({ status }: { status: Status }) {
  return <span className={`dot ${status}`} title={LABEL[status]} aria-label={LABEL[status]} />;
}
