import { useState, useEffect } from 'react';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';

export default function AIDraftEditor({ draftText, onApply }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (draftText) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(draftText);
    }
  }, [draftText]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2 mb-6">
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
      <div className="mt-3 flex justify-end">
        <Button onClick={() => onApply(text)}>
          Use Suggestion
        </Button>
      </div>
    </div>
  );
}
