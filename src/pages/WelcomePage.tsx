import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * İlk sayfa – ekteki gibi: beyaz arka plan, ortada gradient kare logo (içinde siyah U), altında siyah ULIKME.
 */
const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <button
      type="button"
      className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 cursor-pointer border-0"
      onClick={() => navigate('/onboarding')}
    >
      {/* Gradient kare logo – soldan sağa açık mavi → açık turuncu/şeftali */}
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(to right, #A8D4F0 0%, #FFDFB8 100%)',
        }}
      >
        <span className="text-5xl font-black text-black leading-none">U</span>
      </div>

      {/* ULIKME – büyük, kalın, siyah */}
      <h1 className="text-4xl font-bold text-black uppercase tracking-tight">
        ULIKME
      </h1>
    </button>
  );
};

export default WelcomePage;
