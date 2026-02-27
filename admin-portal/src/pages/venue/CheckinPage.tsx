import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { QrCode, CheckCircle2, XCircle, ScanLine, Calendar, Users, Camera, CameraOff } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

type Attendee = {
  id: number;
  name: string;
  email: string;
  ticketCode: string;
  eventTitle: string;
  eventId: number;
  checkedIn: boolean;
  checkedInAt: string | null;
};

// Mock: events and their ticket holders. In production, ticket codes would come from API.
const mockAttendees: Attendee[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', ticketCode: 'T-BOWL-1001', eventTitle: 'Bowling Night', eventId: 1, checkedIn: true, checkedInAt: '2025-01-24 18:00' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', ticketCode: 'T-BOWL-1002', eventTitle: 'Bowling Night', eventId: 1, checkedIn: false, checkedInAt: null },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', ticketCode: 'T-BOWL-1003', eventTitle: 'Bowling Night', eventId: 1, checkedIn: true, checkedInAt: '2025-01-24 18:05' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', ticketCode: 'T-KARA-2001', eventTitle: 'Karaoke Evening', eventId: 2, checkedIn: false, checkedInAt: null },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', ticketCode: 'T-KARA-2002', eventTitle: 'Karaoke Evening', eventId: 2, checkedIn: true, checkedInAt: '2025-01-24 19:00' },
];

const mockEvents = [
  { id: 0, title: 'All events' },
  { id: 1, title: 'Bowling Night' },
  { id: 2, title: 'Karaoke Evening' },
];

const checkinEn = {
  title: 'Ticket Check-in',
  subtitle: 'Scan QR codes or enter ticket codes when guests arrive.',
  qrTicketCode: 'QR / Ticket Code',
  qrTicketDesc: "Scan the guest's QR code or paste their ticket code here",
  placeholder: 'e.g. T-BOWL-1001 or scan QR...',
  checkIn: 'Check In',
  scanWithCamera: 'Scan QR with Camera',
  turnOffCamera: 'Turn Off Camera',
  cameraHint: "Point the camera at the guest's QR code or paste the code above.",
  manualHint: 'Enter or paste the ticket code in the field above.',
  cameraNotSupported: 'This browser does not support camera QR scanning. Enter the ticket code manually.',
  cameraPermissionError: 'Camera access denied or unavailable. Enter the ticket code manually.',
  pointCamera: "Point the camera at the guest's QR code.",
  qrScanned: 'QR scanned. Confirm with "Check In".',
  enterCode: 'Please enter or scan a ticket code.',
  ticketNotFound: 'Ticket not found. Check the code.',
  alreadyCheckedIn: 'Already checked in',
  checkedInSuccess: 'Checked in.',
  event: 'Event',
  allEvents: 'All events',
  checkinList: 'Check-in List',
  checkedInCount: 'checked in',
  noTicketsForEvent: 'No tickets for this event.',
  checkedIn: 'Checked In',
  pending: 'Pending',
  ticket: 'Ticket',
  checkedInAt: 'Checked in',
};
const checkinEs = {
  title: 'Entrada de entradas',
  subtitle: 'Escanea códigos QR o introduce el código de entrada cuando lleguen los invitados.',
  qrTicketCode: 'Código QR / Entrada',
  qrTicketDesc: 'Escanea el código QR del invitado o pega su código de entrada aquí',
  placeholder: 'ej. T-BOWL-1001 o escanear QR...',
  checkIn: 'Registrar entrada',
  scanWithCamera: 'Escanear QR con cámara',
  turnOffCamera: 'Apagar cámara',
  cameraHint: 'Apunta la cámara al código QR del invitado o pega el código arriba.',
  manualHint: 'Introduce o pega el código de entrada en el campo de arriba.',
  cameraNotSupported: 'Este navegador no admite escaneo QR por cámara. Introduce el código manualmente.',
  cameraPermissionError: 'Acceso a cámara denegado o no disponible. Introduce el código manualmente.',
  pointCamera: 'Apunta la cámara al código QR del invitado.',
  qrScanned: 'QR escaneado. Confirma con "Registrar entrada".',
  enterCode: 'Introduce o escanea un código de entrada.',
  ticketNotFound: 'Entrada no encontrada. Comprueba el código.',
  alreadyCheckedIn: 'Ya registrado',
  checkedInSuccess: 'Entrada registrada.',
  event: 'Evento',
  allEvents: 'Todos los eventos',
  checkinList: 'Lista de entradas',
  checkedInCount: 'registrados',
  noTicketsForEvent: 'No hay entradas para este evento.',
  checkedIn: 'Registrado',
  pending: 'Pendiente',
  ticket: 'Entrada',
  checkedInAt: 'Entrada',
};

export default function CheckinPage() {
  const { language } = useLanguage();
  const t = language === 'es' ? checkinEs : checkinEn;
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [ticketCode, setTicketCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supportsBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanRef.current != null) cancelAnimationFrame(scanRef.current);
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    if (!supportsBarcodeDetector) {
      toast.error(t.cameraNotSupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      toast.success(t.pointCamera);
    } catch {
      toast.error(t.cameraPermissionError);
    }
  };

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !supportsBarcodeDetector || !window.BarcodeDetector) return;
    const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });
    let lastCode = '';

    const tick = async () => {
      if (!videoRef.current?.videoWidth || streamRef.current === null) {
        scanRef.current = requestAnimationFrame(tick);
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        const qr = codes[0];
        if (qr?.rawValue && qr.rawValue !== lastCode) {
          lastCode = qr.rawValue;
          const code = qr.rawValue.replace(/^.*\/ticket\/?/i, '').trim() || qr.rawValue;
          setTicketCode(code);
          stopCamera();
          toast.success(t.qrScanned);
          inputRef.current?.focus();
        }
      } catch {
        // ignore decode errors
      }
      scanRef.current = requestAnimationFrame(tick);
    };
    scanRef.current = requestAnimationFrame(tick);
    return () => {
      if (scanRef.current != null) cancelAnimationFrame(scanRef.current);
    };
  }, [cameraActive, supportsBarcodeDetector, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const handleCheckInByCode = () => {
    const code = ticketCode.trim().toUpperCase();
    if (!code) {
      toast.error(t.enterCode);
      return;
    }
    const found = attendees.find(
      (a) => a.ticketCode.toUpperCase() === code || a.ticketCode.replace(/\D/g, '').endsWith(code.replace(/\D/g, ''))
    );
    if (!found) {
      toast.error(t.ticketNotFound);
      return;
    }
    if (found.checkedIn) {
      toast.info(`${found.name} ${t.alreadyCheckedIn} (${found.checkedInAt})`);
      setTicketCode('');
      inputRef.current?.focus();
      return;
    }
    const now = new Date().toLocaleString(locale);
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === found.id ? { ...a, checkedIn: true, checkedInAt: now } : a
      )
    );
    toast.success(`${found.name} ${t.checkedInSuccess}`);
    setTicketCode('');
    inputRef.current?.focus();
  };

  const handleCheckInById = (id: number) => {
    const a = attendees.find((x) => x.id === id);
    if (!a || a.checkedIn) return;
    const now = new Date().toLocaleString(locale);
    setAttendees((prev) =>
      prev.map((x) => (x.id === id ? { ...x, checkedIn: true, checkedInAt: now } : x))
    );
    toast.success(`${a.name} ${t.checkedInSuccess}`);
  };

  const filteredAttendees =
    selectedEventId === 0
      ? attendees
      : attendees.filter((a) => a.eventId === selectedEventId);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-primary" />
                {t.qrTicketCode}
              </CardTitle>
              <CardDescription>{t.qrTicketDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-muted/30 p-2">
                <QrCode className="w-8 h-8 text-primary flex-shrink-0" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={t.placeholder}
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckInByCode()}
                  className="border-0 bg-transparent text-base font-mono focus-visible:ring-0"
                  autoComplete="off"
                />
              </div>
              <Button onClick={handleCheckInByCode} className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t.checkIn}
              </Button>
              {supportsBarcodeDetector && (
                <Button
                  type="button"
                  variant={cameraActive ? 'destructive' : 'outline'}
                  className="w-full"
                  onClick={cameraActive ? stopCamera : startCamera}
                >
                  {cameraActive ? (
                    <>
                      <CameraOff className="w-4 h-4 mr-2" />
                      {t.turnOffCamera}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      {t.scanWithCamera}
                    </>
                  )}
                </Button>
              )}
              {cameraActive && (
                <div className="rounded-xl overflow-hidden border-2 border-primary bg-black">
                  <video ref={videoRef} muted playsInline className="w-full aspect-square object-cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {supportsBarcodeDetector ? t.cameraHint : t.manualHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                {t.event}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {mockEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.id === 0 ? t.allEvents : ev.title}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.checkinList}
            </CardTitle>
            <CardDescription>
              {filteredAttendees.filter((a) => a.checkedIn).length} / {filteredAttendees.length} {t.checkedInCount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredAttendees.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t.noTicketsForEvent}</p>
              ) : (
                filteredAttendees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{a.name}</p>
                        {a.checkedIn ? (
                          <Badge variant="default" className="gap-1 bg-emerald-600">
                            <CheckCircle2 className="w-3 h-3" />
                            {t.checkedIn}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            {t.pending}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{a.email}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {t.ticket}: {a.ticketCode} · {a.eventTitle}
                      </p>
                      {a.checkedInAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">{t.checkedInAt}: {a.checkedInAt}</p>
                      )}
                    </div>
                    {!a.checkedIn && (
                      <Button size="sm" onClick={() => handleCheckInById(a.id)} className="ml-2 flex-shrink-0">
                        {t.checkIn}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
