import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { createCanvas } from 'canvas';

interface QRCodeProps {
    dataForQRcode: string;  // Data to encode into the QR code
    quality: number;          // Width of the QR code
    style: React.CSSProperties;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ dataForQRcode, quality, style }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const createQRCode = async () => {
        try {
            // Create canvas
            const canvas = createCanvas(1000, 1000, "svg");
            
            // Generate QR code on canvas
            await QRCode.toCanvas(canvas, dataForQRcode, {
            errorCorrectionLevel: 'H',
            scale: quality,
            margin: 1,
            color: {
                dark: '#010101',   // Dark color for the QR code
                light: '#f1f1f1',  // Light color for the QR code background
            },
            });

            // Convert canvas to data URL (JPEG format)
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            setQrCodeUrl(dataUrl); // Set the QR code image URL
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    createQRCode();
  }, [dataForQRcode, quality]);

  return (
    <div style={{margin: "auto"}}>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR Code" style={style}/>
      ) : (
        <p>Generating QR Code...</p>
      )}
    </div>
  );
};

export default QRCodeComponent;
