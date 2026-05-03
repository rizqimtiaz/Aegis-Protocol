'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Anomaly {
  label: string;
  confidence: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

interface ForensicCanvasProps {
  imageSrc: string;
  anomalies: Anomaly[];
  isScanning: boolean;
}

export default function ForensicCanvas({ imageSrc, anomalies, isScanning }: ForensicCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const scale = containerWidth / img.width;
        const newWidth = containerWidth;
        const newHeight = img.height * scale;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img || !imageLoaded) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    if (isScanning) {
      ctx.fillStyle = 'rgba(8, 145, 178, 0.15)'; // cyan overlay
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      return;
    }

    anomalies.forEach((anomaly) => {
      const x = anomaly.xMin * dimensions.width;
      const y = anomaly.yMin * dimensions.height;
      const w = (anomaly.xMax - anomaly.xMin) * dimensions.width;
      const h = (anomaly.yMax - anomaly.yMin) * dimensions.height;

      // Draw bounding box
      ctx.shadowColor = '#ef4444'; // red-500
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#f87171'; // red-400
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      
      // Additional inner border for tech feel
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);

      // Draw Label Background
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; // red-900
      const text = `${anomaly.label} [${anomaly.confidence}%]`;
      ctx.font = '11px monospace';
      const textWidth = ctx.measureText(text).width;
      const rectY = y > 20 ? y - 20 : y;
      ctx.fillRect(x, rectY, textWidth + 12, 20);

      // Draw Label Text
      ctx.fillStyle = '#fca5a5'; // red-300
      ctx.fillText(text, x + 6, rectY + 13);
    });
  }, [dimensions, imageLoaded, isScanning, anomalies]);

  return (
    <div ref={containerRef} className="relative w-full flex justify-center bg-black rounded overflow-hidden border border-gray-800">
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] z-10"
          />
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
