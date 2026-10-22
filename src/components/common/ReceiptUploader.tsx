import React, { useRef } from 'react';
import { Paperclip, FileText, X } from 'lucide-react';

interface ReceiptUploaderProps {
  receiptName?: string;
  onReceiptChange: (name: string, url?: string) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  receiptName,
  onReceiptChange
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read preview if image, or store name
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onReceiptChange(file.name, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or doc
      onReceiptChange(file.name, '');
    }
  };

  const handleRemove = () => {
    onReceiptChange('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-800 tracking-wide uppercase">
        Supporting Bill / Receipt Attachment <span className="text-neutral-400 font-normal lowercase">(optional)</span>
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="receipt-file-input"
      />

      {receiptName ? (
        <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium text-neutral-800 truncate">{receiptName}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="receipt-file-input"
          className="flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 hover:bg-neutral-100/60 cursor-pointer transition-colors text-center"
        >
          <Paperclip className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-medium text-neutral-700">Attach receipt or bill voucher (PDF, JPG, PNG)</span>
        </label>
      )}
    </div>
  );
};
