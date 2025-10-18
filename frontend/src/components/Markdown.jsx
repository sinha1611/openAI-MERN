import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CodeBlock({ className = '', children }) {
  const langMatch = className && className.match(/language-(\w+)/);
  const lang = langMatch ? langMatch[1] : 'text';
  const initial = String(children ?? '');

  const [content, setContent] = React.useState(initial);
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [preview, setPreview] = React.useState(false);

  React.useEffect(() => {
    setContent(initial);
    setEditing(false);
    setPreview(false);
    setCopied(false);
  }, [initial]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  function handleDownload() {
    const filename = lang === 'json' ? 'gemini-response.json' : `code-${lang}.txt`;
    downloadText(filename, content);
  }

  function tryParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  const parsed = lang === 'json' ? tryParseJson(content) : null;

  if (lang === 'text') {
    return <span style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{content}</span>;
  }

  return (
    <div style={{ margin: '12px 0', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 8px', borderRadius: 8 }}>{lang}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={buttonStyle(copied)}>{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={() => setEditing((v) => !v)} style={buttonStyle(editing)}>{editing ? 'Close' : 'Edit'}</button>
          <button onClick={handleDownload} style={buttonStyle(false)}>Download</button>
          {lang === 'json' && (
            <button onClick={() => setPreview((v) => !v)} style={buttonStyle(preview)}>{preview ? 'Close Preview' : 'Preview'}</button>
          )}
        </div>
      </div>

      {editing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{ width: '100%', background: '#0f172a', fontFamily: 'monospace', fontSize: 13, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setEditing(false)} style={buttonStyle(false)}>Save</button>
            <button onClick={() => setContent(initial)} style={buttonStyle(false)}>Reset</button>
          </div>
        </div>
      ) : preview && parsed ? (
        <div style={{ background: '#0f172a', color: '#e6edf3', padding: 12, borderRadius: 8 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      ) : (
        <pre style={{ background: '#0f172a', color: '#e6edf3', padding: 12, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
          <code>{content}</code>
        </pre>
      )}
    </div>
  );
}

export default function CodeWithActionsReactMarkdown({ response = '' }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{response}</ReactMarkdown>
    </div>
  );
}

function buttonStyle(active) {
  return {
    border: '1px solid #d1d5db',
    background: active ? '#eef2ff' : '#fff',
    padding: '6px 10px',
    color: '#374151',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13
  };
}