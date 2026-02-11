import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ value, size = 200, className = '' }: QRCodeDisplayProps) {
  if (!value) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-sm text-muted-foreground">No QR code data</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
