import { ReactNode } from 'react';

const ORANGE = '#ED6C27';

interface LiraAvatarScreenProps {
  /** Başlık (örn. "Welcome to Lira") */
  title: string;
  /** Lira'nın konuşma metni; bold vurgular için <strong> kullanılabilir */
  message: ReactNode;
  /** Alt kısımda gösterilecek input / butonlar (OTP, email, isim, doğum tarihi vb.) */
  children?: ReactNode;
  /** "Next" tıklandığında */
  onNext?: () => void;
  /** Geri butonu tıklandığında (verilmezse geri gösterilmez) */
  onBack?: () => void;
  /** Next buton metni */
  nextLabel?: string;
  /** Ses/video kontrolleri gösterilsin mi (volume, pause, next) */
  showMediaControls?: boolean;
  /** Next butonu loading durumu */
  nextLoading?: boolean;
  /** Next butonunu devre dışı bırak (örn. alan boşken) */
  nextDisabled?: boolean;
}

/**
 * Lira avatar ekranı: sanki Lira kullanıcıyla konuşuyormuş gibi tek ekran.
 * İkinci ekran (Welcome to Lira), OTP, email, isim, doğum tarihi vb. için kullanılır.
 */
export function LiraAvatarScreen({
  title,
  message,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  showMediaControls = true,
  nextLoading = false,
  nextDisabled = false,
}: LiraAvatarScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Üst: geri butonu */}
      {onBack && (
        <header className="flex items-center justify-center relative px-4 pt-12 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </header>
      )}

      <div className="flex-1 flex flex-col items-center px-6 pb-8 max-w-md mx-auto w-full">
        {/* Başlık: "Welcome to Lira" vb. */}
        <h1
          className="text-xl font-bold text-center mt-4 mb-6"
          style={{ color: ORANGE }}
        >
          {title}
        </h1>

        {/* Avatar: turuncu–mor–siyah organik blob */}
        <div
          className="w-40 h-40 rounded-full flex-shrink-0 mb-6"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #ED6C27 0%, #c94a8a 40%, #2d1b4e 80%, #0d0d0d 100%)',
            boxShadow: '0 8px 32px rgba(237, 108, 39, 0.25)',
          }}
          aria-hidden
        />

        {/* Lira'nın mesajı */}
        <div className="text-center text-gray-600 text-sm leading-relaxed mb-8 max-w-sm">
          {message}
        </div>

        {/* Input / form alanı (OTP, email, isim, doğum tarihi vb.) */}
        {children && (
          <div className="w-full space-y-4 mb-8">
            {children}
          </div>
        )}

        {/* Alt: medya kontrolleri (volume, pause, next) */}
        {showMediaControls && (
          <div className="flex items-center justify-center gap-8 mt-auto pt-6">
            <button type="button" className="p-2" aria-label="Volume">
              <svg className="w-6 h-6" style={{ color: ORANGE }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </button>
            <button type="button" className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: ORANGE }} aria-label="Pause">
              <div className="w-1 h-4 rounded-full mr-0.5" style={{ backgroundColor: ORANGE }} />
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: ORANGE }} />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={nextLoading || nextDisabled}
              className="p-2 disabled:opacity-50"
              aria-label="Next"
            >
              <svg className="w-8 h-8" style={{ color: ORANGE }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Next butonu (medya kontrolleri yoksa veya ek CTA gerekiyorsa) */}
        {onNext && !showMediaControls && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextLoading || nextDisabled}
            className="w-full py-3 rounded-xl font-semibold text-white mt-6 disabled:opacity-60"
            style={{ backgroundColor: ORANGE }}
          >
            {nextLoading ? '...' : nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
