import crypto from 'crypto';

/**
 * Generate QR code data for enrollment or meetup join
 */
export function generateQRCodeData(
  enrollmentId: string | null,
  meetupMemberId: string | null,
  classId: string | null,
  meetupId: string | null,
  userId: string
): string {
  const qrData = {
    enrollmentId,
    meetupMemberId,
    classId,
    meetupId,
    userId,
    timestamp: Date.now(),
  };

  // Generate validation hash
  const secret = process.env.QR_CODE_SECRET || 'default-secret-key-change-in-production';
  const dataString = JSON.stringify(qrData);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('hex');

  const qrCodeData = {
    ...qrData,
    hash,
  };

  return JSON.stringify(qrCodeData);
}

/**
 * Generate unique ticket number
 */
export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `TKT-${year}-${random}`;
}
