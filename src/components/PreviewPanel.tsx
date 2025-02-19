'use client';

import { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface PreviewPanelProps {
  file: File | null;
  latexCode: string;
}

export default function PreviewPanel({ file, latexCode }: PreviewPanelProps) {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [highlightedLatex, setHighlightedLatex] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (latexCode) {
      const highlighted = hljs.highlight(latexCode, { language: 'tex' }).value;
      setHighlightedLatex(highlighted);
    }
  }, [latexCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(latexCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="grid grid-cols-12 gap-6 w-full h-[calc(100vh-200px)] min-h-[700px] bg-white rounded-lg shadow-sm p-6">
      {/* Pane 1: File Preview */}
      <div className="col-span-5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-700">Document Preview</h2>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          {file && (
            file.type === 'application/pdf' ? (
              <div className="w-full h-full">
                {fileUrl && (
                  <object
                    data={fileUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                      PDF preview not available. Please download to view.
                    </div>
                  </object>
                )}
              </div>
            ) : file.type.startsWith('image/') ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={fileUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                Preview not available for this file type
              </div>
            )
          )}
        </div>
      </div>

      {/* Pane 2: LaTeX Code */}
      <div className="col-span-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-700">LaTeX Code</h2>
          <button
            onClick={handleCopy}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            {copyFeedback ? (
              <span className="text-green-600">✓ Copied!</span>
            ) : (
              'Copy'
            )}
          </button>
        </div>
        <div className="flex-1 bg-[#1E1E1E] rounded-lg overflow-hidden">
          <pre className="h-full overflow-auto p-4 text-sm">
            <code
              dangerouslySetInnerHTML={{ __html: highlightedLatex }}
              className="language-tex"
            />
          </pre>
        </div>
      </div>

      {/* Pane 3: LaTeX Preview */}
      <div className="col-span-3 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-700">LaTeX Preview</h2>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg overflow-auto">
          <div className="p-4 prose prose-sm max-w-none">
            <Latex>{latexCode}</Latex>
          </div>
        </div>
      </div>
    </div>
  );
} 