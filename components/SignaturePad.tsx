import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  initialData?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, onSave, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (initialData && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            setHasSignature(true);
        };
        img.src = initialData;
    }
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      save();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSave('');
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4 bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded cursor-crosshair relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          className="w-full h-[150px] touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
             Tanda tangan di sini
           </div>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;