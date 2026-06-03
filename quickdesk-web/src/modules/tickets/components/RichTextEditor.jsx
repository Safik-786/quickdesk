import { useState, useEffect, useRef } from 'react';

// ── Formatted HTML Text Renderer ─────────────────────────────────────────────
export function FormattedText({ text, className = '' }) {
  if (!text) return null;
  const isHtml = text.trim().startsWith('<') || text.includes('</') || text.includes('<p>') || text.includes('<br>');
  
  if (isHtml) {
    return (
      <div 
        className={`prose prose-sm prose-slate max-w-none dark:prose-invert 
          prose-headings:font-bold prose-headings:text-slate-900 
          prose-p:leading-relaxed prose-p:mb-3.5 prose-p:text-slate-700
          prose-ul:list-disc prose-ul:list-inside prose-ul:pl-4 prose-ul:my-2
          prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-4 prose-ol:my-2
          prose-strong:font-bold prose-strong:text-slate-900
          prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-2 prose-blockquote:text-gray-600 prose-blockquote:bg-slate-50/80 prose-blockquote:rounded-r-md prose-blockquote:italic
          ${className}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  
  return <p className={`whitespace-pre-wrap leading-relaxed text-slate-700 ${className}`}>{text}</p>;
}

// ── Color Options for Editor ─────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Default', value: '#1e293b' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Red', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Clear', value: 'transparent' },
  { label: 'Yellow Highlight', value: '#fef08a' },
  { label: 'Green Highlight', value: '#bbf7d0' },
  { label: 'Blue Highlight', value: '#bfdbfe' },
  { label: 'Purple Highlight', value: '#e9d5ff' },
  { label: 'Red Highlight', value: '#fecdd3' },
];

// ── Main RichTextEditor Component ────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type your response here...',
  disabled = false,
  ticketInfo = {},
  showHeader = true,
  centerToolbarContent,
  endToolbarContent,
}) {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'display-board'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  
  // Selection states to toggle active states in toolbar
  const [editorStates, setEditorStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  });

  // State stats for character count, word count, read time, and tone analysis
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(1);
  const [tone, setTone] = useState({ name: 'Direct', color: 'text-gray-500 bg-gray-100 border-gray-200' });

  const editorRef = useRef(null);

  // Update statistics dynamically when writing
  const updateStats = () => {
    if (!editorRef.current) return;
    const plainText = editorRef.current.innerText || '';
    const chars = plainText.length;
    const words = plainText.trim() === '' ? 0 : plainText.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 200));

    setCharCount(chars);
    setWordCount(words);
    setReadTime(time);

    // Tone calculation
    const textLower = plainText.toLowerCase();
    const hasCode = editorRef.current.innerHTML.includes('<code') || editorRef.current.innerHTML.includes('<pre');
    const hasBulleted = editorRef.current.innerHTML.includes('<ul') || editorRef.current.innerHTML.includes('<ol');

    let toneObj = { name: 'Helpful & Friendly', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (words < 5) {
      toneObj = { name: 'Direct', color: 'text-gray-500 bg-gray-100 border-gray-200' };
    } else if (textLower.includes('apolog') || textLower.includes('sorry') || textLower.includes('understand')) {
      toneObj = { name: 'Empathetic & Caring', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    } else if (hasCode || textLower.includes('configure') || textLower.includes('terminal') || textLower.includes('database')) {
      toneObj = { name: 'Technical & Instructive', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    } else if (hasBulleted || textLower.includes('steps') || textLower.includes('first') || textLower.includes('second')) {
      toneObj = { name: 'Structured & Clear', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    } else if (textLower.includes('please') || textLower.includes('dear') || textLower.includes('regards')) {
      toneObj = { name: 'Formal & Professional', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    setTone(toneObj);
  };

  // Sync value from parent if it changes outside (e.g. from AI suggestion)
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
      updateStats();
    }
  }, [value]);

  // Handle local changes inside contenteditable
  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      // If content is just a single empty br, treat as empty
      if (htmlContent === '<br>' || htmlContent === '<p><br></p>') {
        onChange('');
      } else {
        onChange(htmlContent);
      }
    }
    updateSelectionStates();
    updateStats();
  };

  // Intercept paste to clean plain text or keep format nicely
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Run formatting commands on Selection
  const executeCommand = (command, argument = null) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    updateSelectionStates();
    handleInput();
  };

  // Track selection position to set toolbar active states
  const updateSelectionStates = () => {
    setEditorStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
      alignLeft: document.queryCommandState('justifyLeft') || (!document.queryCommandState('justifyCenter') && !document.queryCommandState('justifyRight')),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
    });
  };

  // Insert Custom link
  const insertLink = () => {
    const url = prompt('Enter the link URL (e.g., https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className={`flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-1 ring-slate-900/10' : 'relative'}`}>
      
      {/* Editor Header & Tab Switcher */}
      {showHeader && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === 'write' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Response
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('display-board');
              setIsColorMenuOpen(false);
              setIsHighlightMenuOpen(false);
            }}
            className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === 'display-board' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Customer View
            <span className="bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded-full text-[9px] font-extrabold tracking-wide uppercase scale-90">Live</span>
          </button>
        </div>

        </div>
      )}

      {activeTab === 'write' ? (
        <>
          {/* Rich Text Toolbar - Scrollable on Mobile */}
          <div className="flex flex-col md:flex-row justify-between items-center rounded-t-xl w-full border-b border-slate-100 bg-slate-50 sticky top-0 z-25">
            <div className="flex flex-row overflow-x-auto hide-scrollbar gap-1.5 p-1 w-full items-center [&_button]:bg-white [&_button]:shadow-sm [&_button]:cursor-pointer [&_button]:shrink-0 [&_button]:w-7 [&_button]:h-7 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:!p-0 [&_div.w-px]:shrink-0">
              {/* Bold */}
              <button
              type="button"
              onClick={() => executeCommand('bold')}
              className={`p-1.5 rounded font-bold transition-all ${editorStates.bold ? 'bg-indigo-50 text-indigo-700 font-extrabold ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Bold"
            >
              <span className="text-sm px-0.5">B</span>
            </button>
            {/* Italic */}
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className={`p-1.5 rounded italic transition-all ${editorStates.italic ? 'bg-indigo-50 text-indigo-700 font-bold ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Italic"
            >
              <span className="text-sm px-0.5 font-serif">I</span>
            </button>
            {/* Underline */}
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className={`p-1.5 rounded underline transition-all ${editorStates.underline ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Underline"
            >
              <span className="text-sm px-0.5">U</span>
            </button>
            {/* Strikethrough */}
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              className={`p-1.5 rounded line-through transition-all ${editorStates.strikeThrough ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Strikethrough"
            >
              <span className="text-sm px-0.5">S</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 self-center"></div>

            {/* Heading options */}
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50 font-bold text-xs flex items-center"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50 font-bold text-xs flex items-center"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50 font-bold text-xs flex items-center"
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<p>')}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50 text-xs flex items-center"
              title="Paragraph"
            >
              P
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 self-center"></div>

            {/* Unordered List */}
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className={`p-1.5 rounded transition-all ${editorStates.bulletList ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Ordered List */}
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className={`p-1.5 rounded transition-all ${editorStates.orderedList ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>

            {/* Quote Block */}
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50"
              title="Quote"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 self-center"></div>

            {/* Alignment left */}
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className={`p-1.5 rounded transition-all ${editorStates.alignLeft ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Align Left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
              </svg>
            </button>
            {/* Alignment center */}
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className={`p-1.5 rounded transition-all ${editorStates.alignCenter ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Align Center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M6 18h12" />
              </svg>
            </button>
            {/* Alignment right */}
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className={`p-1.5 rounded transition-all ${editorStates.alignRight ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-500 hover:bg-slate-50'}`}
              title="Align Right"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
              </svg>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 self-center"></div>

            {/* Text Color dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsColorMenuOpen(!isColorMenuOpen);
                  setIsHighlightMenuOpen(false);
                }}
                className="p-1.5 rounded text-gray-500 hover:bg-slate-50 flex items-center gap-0.5"
                title="Text Color"
              >
                <span className="font-semibold text-xs border-b-2 border-indigo-600 px-0.5">A</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isColorMenuOpen && (
                <div className="absolute left-0 mt-1.5 p-2 bg-white rounded-lg border border-slate-200 shadow-xl z-30 grid grid-cols-3 gap-1.5 min-w-[120px]">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        executeCommand('foreColor', c.value);
                        setIsColorMenuOpen(false);
                      }}
                      className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Highlight Background Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsHighlightMenuOpen(!isHighlightMenuOpen);
                  setIsColorMenuOpen(false);
                }}
                className="p-1.5 rounded text-gray-500 hover:bg-slate-50 flex items-center gap-0.5"
                title="Highlight Color"
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isHighlightMenuOpen && (
                <div className="absolute left-0 mt-1.5 p-2 bg-white rounded-lg border border-slate-200 shadow-xl z-30 grid grid-cols-3 gap-1.5 min-w-[120px]">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        executeCommand('backColor', c.value);
                        setIsHighlightMenuOpen(false);
                      }}
                      className={`w-6 h-6 rounded-full border border-slate-200 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center ${c.value === 'transparent' ? 'bg-slate-100' : ''}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {c.value === 'transparent' && <span className="text-[10px] text-gray-400">×</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Insert Link */}
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>

            {/* Clear Formatting */}
            <button
              type="button"
              onClick={() => {
                executeCommand('removeFormat');
                executeCommand('formatBlock', '<p>');
              }}
              className="p-1.5 rounded text-gray-500 hover:bg-slate-50"
              title="Clear Formatting"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            </div>

            {/* Action controls (Desktop) */}
            <div className="hidden md:flex items-center gap-2 pr-2">
              {/* Undo */}
              <button
                type="button"
                onClick={() => executeCommand('undo')}
                disabled={disabled}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-slate-50 transition-colors"
                title="Undo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              {/* Redo */}
              <button
                type="button"
                onClick={() => executeCommand('redo')}
                disabled={disabled}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-slate-50 transition-colors"
                title="Redo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1"></div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-slate-50 transition-colors flex items-center"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-16-4V7a3 3 0 013-3h10a3 3 0 013 3v4M4 10h16" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" />
                  </svg>
                )}
              </button>
            </div>
          </div>



          <div className="flex items-end gap-2 bg-slate-50 md:bg-white p-2 md:p-0">
            {/* Editable Canvas */}
            <div className="relative flex-grow overflow-hidden bg-white px-4 py-2 flex flex-col focus-within:ring-offset-0 focus-within:outline-none transition-all rounded-2xl md:rounded-none border border-slate-200 md:border-none">
            <div
              ref={editorRef}
              contentEditable={!disabled}
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyUp={updateSelectionStates}
              onMouseUp={updateSelectionStates}
              onFocus={updateSelectionStates}
              className="flex-grow focus:outline-none text-slate-800 text-sm overflow-y-auto overflow-x-hidden break-words max-h-[100px] leading-relaxed 
                h-full prose prose-sm prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 
                prose-p:leading-relaxed prose-p:mb-3.5 prose-p:text-slate-700
                prose-ul:list-disc prose-ul:list-inside prose-ul:pl-4 prose-ul:my-2
                prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-4 prose-ol:my-2
                prose-strong:font-bold prose-strong:text-slate-900
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-2 prose-blockquote:text-gray-600 prose-blockquote:bg-slate-50/80 prose-blockquote:rounded-r-md prose-blockquote:italic"
              style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            />
            
              {/* Custom Placeholder */}
              {!value && (
                <div className="absolute top-2 left-4 md:left-4 text-gray-400 text-sm pointer-events-none select-none italic">
                  {placeholder}
                </div>
              )}
            </div>
            
            {/* Action controls (Send, AI) next to input */}
            <div className="flex items-center gap-1 shrink-0 mb-1 md:mb-2 md:mr-2">
              {centerToolbarContent}
              {endToolbarContent}
            </div>
          </div>
          
          {/* Quick stats footer (Restored below editor) */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between text-[10px] text-gray-500 rounded-b-xl overflow-x-auto hide-scrollbar whitespace-nowrap">
            <div className="flex gap-4 items-center">
              <span><strong>{wordCount}</strong> words</span>
              <span><strong>{charCount}</strong> characters</span>
              <span className="hidden sm:inline">Read time: <strong>{readTime}m</strong></span>
            </div>
            <div className="flex gap-4 items-center shrink-0">
              <span className={`px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${tone.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
                {tone.name} Tone
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Display Board - Live Preview Card */
        <div className="p-5 bg-slate-100/50 rounded-b-xl flex-grow overflow-y-auto max-h-[500px]">
          
          {/* Mock Client Email Window */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden max-w-3xl mx-auto flex flex-col">
            
            {/* Mock Header Menu */}
            <div className="bg-slate-950 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-gray-400 font-mono ml-2">quickdesk-secure-portal-preview</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-800 px-2 py-0.5 rounded">Customer View</span>
            </div>
            
            {/* Meta Headers */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-gray-500">
                <div>
                  <span className="font-semibold text-slate-800">From:</span> quickdesk-support@company.com
                </div>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
              <div className="text-gray-500">
                <span className="font-semibold text-slate-800">To:</span> {ticketInfo?.employee?.email || 'customer@company.com'}
              </div>
              <div className="text-gray-500">
                <span className="font-semibold text-slate-800">Subject:</span> Re: {ticketInfo?.title || 'Ticket Inquiry Response'}
              </div>
            </div>

            {/* Email Message Content Area */}
            <div className="p-6 bg-white min-h-[220px]">
              {/* Brand Letterhead */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow">Q</div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-800">Quickdesk Inc.</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Official Response</span>
              </div>

              {/* Formatted Reply Body */}
              {value ? (
                <FormattedText text={value} />
              ) : (
                <div className="text-center py-12 text-gray-400 italic text-sm">
                  Write a reply on the editor to preview customer formatting here.
                </div>
              )}
              
              {/* Automated Footer */}
              <div className="mt-8 pt-5 border-t border-slate-100 text-[10px] text-gray-400 text-center">
                This reply is sent securely through your Quickdesk Customer Portal. For further assistance, please contact help@company.com.
              </div>
            </div>
          </div>
          
          {/* Display Board Metrics Details */}
          <div className="max-w-3xl mx-auto mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-xs">
              <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Tone Analysis</div>
              <div className="text-xs font-semibold text-indigo-700 truncate">{tone.name}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-xs">
              <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Estimated Reading Time</div>
              <div className="text-xs font-semibold text-slate-800">{readTime} min read</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-xs">
              <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Formatting Depth</div>
              <div className="text-xs font-semibold text-emerald-600">
                {value?.includes('<') ? 'Rich Format' : 'Plain Text'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
