'use client';

import { useCallback, useState, useEffect, MouseEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PreviewPanel from './PreviewPanel';

interface FileUploadProps {
  onFileChange: (hasFile: boolean) => void;
}

const ACCEPTED_FILE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({ onFileChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [latexCode, setLatexCode] = useState('');

  useEffect(() => {
    onFileChange(!!file && !!latexCode && !isUploading);
  }, [file, latexCode, isUploading, onFileChange]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setFile(selectedFile);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload successful, received response:', data);

      setLatexCode(data.latex);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setError('');
    setLatexCode('');
  };

  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    removeFile();
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${file ? 'bg-gray-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">{file.name}</span>
            </div>
            <button
              onClick={handleRemoveClick}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <p className="text-base text-gray-700">
                <span className="text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-sm text-gray-500">
                PNG or JPG (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Processing file...</span>
        </div>
      )}

      {file && latexCode && !isUploading && (
        <PreviewPanel file={file} latexCode={latexCode} />
      )}
    </div>
  );
} 