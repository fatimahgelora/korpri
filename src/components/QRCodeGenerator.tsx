import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

function QRCodeGenerator({ value, size = 200, className = '' }: QRCodeGeneratorProps) {
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt={`QR Code for ${value}`}
        className="border border-gray-200 rounded-lg"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to icon if QR code fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div 
        className="hidden items-center justify-center bg-gray-100 border border-gray-200 rounded-lg"
        style={{ width: size, height: size }}
      >
        <QrCode className="w-16 h-16 text-gray-400" />
      </div>
    </div>
  );
}

export default QRCodeGenerator;