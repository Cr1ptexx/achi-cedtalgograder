import type { ReactNode } from 'react';
import { CodePanel, StepperControls } from '../Stepper';
import { useStepper } from '../useStepper';

export type VFrame = {
  /** index of the highlighted code line, or -1 for none */
  line: number;
  msg: string;
  tone?: 'good' | 'bad' | 'back';
  vars?: [string, string | number][];
  stage: ReactNode;
};

/** Shared frame: options row, stage + code panel, stepper controls. */
export default function StepShell({ frames, code, title, resetKey, options, label }: {
  frames: VFrame[];
  code: string[];
  title: string;
  resetKey: string;
  options?: ReactNode;
  label: string;
}) {
  const s = useStepper(frames.length, resetKey);
  const f = frames[Math.min(s.i, frames.length - 1)];
  const last = s.i >= frames.length - 1;
  return (
    <div className="viz" tabIndex={0} onKeyDown={s.onKeyDown} aria-label={label}>
      {options && <div className="viz-options">{options}</div>}
      <div className="viz-grid">
        <div className="viz-stage">
          {f.stage}
          <div className={`step-note ${f.tone ?? (last ? 'good' : '')}`} aria-live="polite">{f.msg}</div>
        </div>
        <CodePanel title={title} lines={code} active={f.line >= 0 ? f.line : null} vars={f.vars} />
      </div>
      <StepperControls s={s} />
    </div>
  );
}
