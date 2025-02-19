'use client';

import FileUpload from '@/components/FileUpload'
import { useState } from 'react';

export default function Home() {
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full max-w-[95%] mx-auto pt-8 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl text-center">
          Doc2LaTeX
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mt-4 mb-8">
          Convert your documents and images into beautifully formatted LaTeX code with ease.
        </p>
        <FileUpload onFileChange={setIsFileUploaded} />
      </main>
      {!isFileUploaded && (
        <footer className="text-sm text-gray-500 text-center py-4">
          Supported formats: PDF, DOC, DOCX, PNG, JPG, JPEG
        </footer>
      )}
    </div>
  );
}
