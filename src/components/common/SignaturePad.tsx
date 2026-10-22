import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SignaturePadProps {
  label: string;
  initialSignature?: string;
  onSignatureChange: (signatureDataUrl: string) => void;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  initialSignature = '',
  onSignatureChange,
  required = false
}) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [signaturePreview, setSignaturePreview] = useState<string>(initialSignature);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialSignature) {
      setSignaturePreview(initialSignature);
    }
  }, [initialSignature]);

  // Set up canvas context
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignaturePreview('');
    onSignatureChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSignaturePreview(result);
      onSignatureChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-wide uppercase">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        
        {/* Toggle between Draw and Upload modes */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'draw'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <PenTool className="w-3 h-3" />
            <span>Draw</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'upload'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 bg-white dark:bg-neutral-850 relative overflow-hidden transition-colors">
        {mode === 'draw' ? (
          <div>
            <div className="relative border border-dashed border-neutral-300 dark:border-neutral-700 rounded-md bg-white">
              <canvas
                ref={canvasRef}
                width={360}
                height={120}
                className="w-full h-28 touch-none cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-200 pt-1">
                <span>Sign above the line</span>
                <span>Canvas active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-1 text-xs">
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
              {signaturePreview ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Signature recorded
                </span>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500">Draw with mouse or fingertip</span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`sig-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <label
              htmlFor={`sig-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100/70 dark:hover:bg-neutral-750 transition-colors cursor-pointer text-center"
            >
              <ImageIcon className="w-6 h-6 text-neutral-400 mb-1" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Click to choose signature image</span>
              <span className="text-[11px] text-neutral-400 mt-0.5">PNG, JPG, or SVG with transparent/white background</span>
            </label>

            {signaturePreview && (
              <div className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="h-10 max-w-[120px] object-contain border border-neutral-200 bg-white rounded px-1"
                  />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Image uploaded</span>
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
