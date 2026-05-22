import { useState, useEffect } from 'react';

export default function AIDraftEditor({ draftText, onApply }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (draftText) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(draftText);
    }
  }, [draftText]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h4 className="font-semibold text-indigo-900">AI Suggested Reply</h4>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] text-sm text-gray-700 bg-white"
        placeholder="Generating suggestion..."
      />
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onApply(text)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Use Suggestion
        </button>
      </div>
    </div>
  );
}
