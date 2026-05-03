'use client';

import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onImageSelected: (dataUrl: string) => void;
}

export default function UploadZone({ onImageSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageSelected(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageSelected(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelected]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full h-80 border border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
        isDragging
          ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
          : 'border-gray-700 bg-gray-900/30 hover:border-gray-500 hover:bg-gray-800/40'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <UploadCloud className={`w-16 h-16 transition-colors ${isDragging ? 'text-cyan-400' : 'text-gray-500'}`} />
        <div className="text-center">
          <p className="font-mono text-sm text-gray-300 mb-1">
            {isDragging ? '>> INITIALIZE_UPLOAD_SEQUENCE <<' : 'DRAG AND DROP TARGET IMAGERY'}
          </p>
          <p className="font-mono text-xs text-gray-600">
            [ MAX RESOLUTION SUPPORTED: 4K ]
          </p>
        </div>
      </div>
    </motion.div>
  );
}
