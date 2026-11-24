import { useState } from 'react';
import type { QuizItem } from '../data/types';

function Question({ item, n }: { item: QuizItem; n: number }) {
  const [pick, setPick] = useState<number | null>(null);
  const answered = pick !== null;
  return (
    <div className="card quiz">
      <div className="quiz-q"><span className="quiz-n">{n}</span>{item.q}</div>
      <div className="quiz-choices">
        {item.choices.map((c, k) => {
          const state = !answered ? '' : k === item.answer ? 'right' : k === pick ? 'wrong' : 'off';
          return (
            <button key={k} className={`choice ${state}`} disabled={answered} onClick={() => setPick(k)}>
              {c}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`quiz-why ${pick === item.answer ? 'right' : 'wrong'}`}>
          <b>{pick === item.answer ? 'ถูกต้อง ✓' : 'ยังไม่ใช่'}</b> {item.why}
          <button className="link" onClick={() => setPick(null)}>ลองใหม่</button>
        </div>
      )}
    </div>
  );
}

export default function Quiz({ items }: { items: QuizItem[] }) {
  return <div className="quiz-list">{items.map((q, k) => <Question key={k} item={q} n={k + 1} />)}</div>;
}
