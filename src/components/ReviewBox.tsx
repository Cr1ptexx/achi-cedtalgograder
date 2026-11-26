import { useEffect, useRef, useState } from 'react';
import { getNote, getRedo, setNote, setRedo, useProgressVersion } from '../store/progress';

/** Mark a problem to redo later and jot down what went wrong. Private, stored in this browser only. */
export default function ReviewBox({ code }: { code: string }) {
  useProgressVersion();
  const redo = getRedo(code);
  const [text, setText] = useState(() => getNote(code));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (v: string) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(code, v), 400);
  };

  return (
    <div className="review-box">
      <div className="review-head">
        <b>ทบทวนข้อนี้</b>
        <button className={`btn small redo-btn ${redo ? 'on' : ''}`} aria-pressed={redo} onClick={() => setRedo(code, !redo)}>
          {redo ? '↻ ทำเครื่องหมายทำซ้ำแล้ว' : '↻ ทำซ้ำทีหลัง'}
        </button>
      </div>
      <label className="small muted" htmlFor={`note-${code}`}>พลาดตรงไหน? จดไว้ให้ตัวเอง (เห็นแค่ในเบราว์เซอร์นี้)</label>
      <textarea
        id={`note-${code}`} className="textarea review-note" rows={3} value={text}
        placeholder="เช่น ลืมคืนค่า used[] / ใช้ int ล้น / ลืมกรณี n = 1"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { clearTimeout(timer.current); setNote(code, text); }}
      />
    </div>
  );
}
