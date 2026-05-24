import { useState, useEffect } from 'react';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';

export default function AIDraftEditor({ draftText, citations = [], onApply }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (draftText) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(draftText);
    }
  }, [draftText]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h4 className="font-semibold text-indigo-900">AI Suggested Reply</h4>
      </div>
      <Input
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Generating suggestion..."
      />
      
      {/* Citations List */}
      {citations && citations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-indigo-100/50 flex flex-wrap items-center gap-2 text-xs text-indigo-700">
          <span className="font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Sources Cited ({citations.length}):
          </span>
          {citations.map((c, i) => (
            <span key={i} className="bg-indigo-100/70 text-indigo-800 px-2 py-0.5 rounded font-mono text-[10px] border border-indigo-200/50">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button onClick={() => onApply(text)}>
          Use Suggestion
        </Button>
      </div>
    </div>
  );
}
