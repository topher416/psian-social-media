import { useState } from 'react';

export function ExportDialog({
  markdown,
  filename,
  onClose,
}: {
  markdown: string;
  filename: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Ready for Topher 🎉</h2>
        <p className="muted small">
          This is the exact format the publishing pipeline reads. Copy it or download the file and send it
          to Topher — he’ll review and publish.
        </p>
        <div className="actions">
          <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy to clipboard'}</button>
          <button className="ghost" onClick={download}>Download {filename}</button>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <pre style={{ marginTop: 14 }}>{markdown}</pre>
      </div>
    </div>
  );
}
