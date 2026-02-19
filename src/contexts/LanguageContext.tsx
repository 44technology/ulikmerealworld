import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'search': 'Search',
    'filter': 'Filter',
    'apply': 'Apply',
    'clear': 'Clear',
    'close': 'Close',
    
    // Settings
    'settings': 'Settings',
    'language': 'Language',
    'english': 'English',
    'spanish': 'Spanish',
    'account': 'Account',
    'privacy': 'Privacy & Security',
    'support': 'Support',
    'logout': 'Log Out',
    'deleteAccount': 'Delete Account',
    
    // Mentors
    'mentors': 'Mentors & Trainers',
    'mentorProfile': 'Mentor Profile',
    'viewClasses': 'View Classes',
    'message': 'Message',
    'about': 'About',
    'expertise': 'Areas of Expertise',
    'achievements': 'Achievements & Awards',
    'availableClasses': 'Available Classes',
    'noClasses': 'No classes available',
    'students': 'Students',
    'reviews': 'Reviews',
    'yearsExperience': 'Years Experience',
    
    // Payment Success
    'paymentSuccessful': 'Payment Successful!',
    'paymentCompleted': 'Payment completed',
    'assistantInfo': 'From now on, assistant Lira will provide you with all necessary information.',
    'classInfo': 'Class Information',
    'whatToDo': 'What You Need to Do',
    'waitForAssistant': 'Wait for information from assistant Lira',
    'waitForAssistantDesc': 'Class materials and important updates will be sent to you',
    'joinChat': 'Join the class chat group',
    'joinChatDesc': 'You can communicate with other students and the host',
    'checkNotifications': 'Check notifications',
    'checkNotificationsDesc': 'Keep notifications enabled for class reminders and updates',
    'startDate': 'Start Date',
    'endDate': 'End Date',
    'schedule': 'Schedule',
    'totalDuration': 'Total Duration',
    'weeks': 'weeks',
    'backToDetails': 'Back to Class Details',
    'enrollmentSuccessful': 'Enrollment Successful!',

    // Settings – extended
    'editProfile': 'Edit Profile',
    'emailSettings': 'Email Settings',
    'phoneNumber': 'Phone Number',
    'privacySettings': 'Privacy Settings',
    'notifications': 'Notifications',
    'helpCenter': 'Help Center',
    'contactUs': 'Contact Us',
    'ads': 'Ads',
    'adFreeExperience': 'Ad-free experience',
    'adFreeExperienceDesc': "You won't see ads in free classes or across the app.",
    'showAds': 'Show ads',
    'showAdsDesc': 'Free experience shows ads. Turn off for $9.99 one-time.',
    'goAdFree': 'Go ad-free',
    'dangerZone': 'Danger Zone',
    'logOut': 'Log Out',
    'logOutTitle': 'Log Out',
    'logOutConfirm': "Are you sure you want to log out? You'll need to sign in again to access your account.",
    'deleteAccountTitle': 'Delete Account',
    'deleteAccountConfirm': 'This action cannot be undone. This will permanently delete your account and all associated data.',
    'loggedOutSuccess': 'Logged out successfully',
    'languageChangedEn': 'Language changed to English',
    'languageChangedEs': 'Idioma cambiado a español',
    'accountDeletionNotImplemented': 'Account deletion not implemented yet',
    'selectLanguage': 'Select your preferred language',
    'goAdFreeTitle': 'Go ad-free',
    'goAdFreeDesc': 'To stop seeing ads in free classes and across the app, a one-time payment of $9.99 is required. You will not see ads again after this purchase.',
    'oneTimePayment': 'One-time payment',
    'noSubscription': 'No subscription. Pay once, enjoy ad-free forever.',
    'processing': 'Processing...',
    'payAmount': 'Pay $9.99',
    'adFreeSuccess': 'You now have an ad-free experience!',
    'paymentFailed': 'Payment failed. Please try again.',
  },
  es: {
    // Common
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'cancel': 'Cancelar',
    'save': 'Guardar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'apply': 'Aplicar',
    'clear': 'Limpiar',
    'close': 'Cerrar',
    
    // Settings
    'settings': 'Configuración',
    'language': 'Idioma',
    'english': 'Inglés',
    'spanish': 'Español',
    'account': 'Cuenta',
    'privacy': 'Privacidad y Seguridad',
    'support': 'Soporte',
    'logout': 'Cerrar Sesión',
    'deleteAccount': 'Eliminar Cuenta',
    
    // Mentors
    'mentors': 'Mentores y Entrenadores',
    'mentorProfile': 'Perfil del Mentor',
    'viewClasses': 'Ver Clases',
    'message': 'Mensaje',
    'about': 'Acerca de',
    'expertise': 'Áreas de Especialización',
    'achievements': 'Logros y Premios',
    'availableClasses': 'Clases Disponibles',
    'noClasses': 'No hay clases disponibles',
    'students': 'Estudiantes',
    'reviews': 'Reseñas',
    'yearsExperience': 'Años de Experiencia',
    
    // Payment Success
    'paymentSuccessful': '¡Pago Exitoso!',
    'paymentCompleted': 'Pago completado',
    'assistantInfo': 'A partir de ahora, el asistente Lira te proporcionará toda la información necesaria.',
    'classInfo': 'Información de la Clase',
    'whatToDo': 'Lo Que Necesitas Hacer',
    'waitForAssistant': 'Espera información del asistente Lira',
    'waitForAssistantDesc': 'Los materiales de clase y actualizaciones importantes te serán enviados',
    'joinChat': 'Únete al grupo de chat de la clase',
    'joinChatDesc': 'Puedes comunicarte con otros estudiantes y el host',
    'checkNotifications': 'Revisa las notificaciones',
    'checkNotificationsDesc': 'Mantén las notificaciones activadas para recordatorios y actualizaciones de clase',
    'startDate': 'Fecha de Inicio',
    'endDate': 'Fecha de Finalización',
    'schedule': 'Horario',
    'totalDuration': 'Duración Total',
    'weeks': 'semanas',
    'backToDetails': 'Volver a Detalles de la Clase',
    'enrollmentSuccessful': '¡Inscripción exitosa!',

    // Settings – extended
    'editProfile': 'Editar perfil',
    'emailSettings': 'Configuración de correo',
    'phoneNumber': 'Número de teléfono',
    'privacySettings': 'Configuración de privacidad',
    'notifications': 'Notificaciones',
    'helpCenter': 'Centro de ayuda',
    'contactUs': 'Contáctanos',
    'ads': 'Anuncios',
    'adFreeExperience': 'Experiencia sin anuncios',
    'adFreeExperienceDesc': 'No verás anuncios en clases gratuitas ni en la aplicación.',
    'showAds': 'Mostrar anuncios',
    'showAdsDesc': 'La experiencia gratuita muestra anuncios. Desactívalos por 9,99 $ único.',
    'goAdFree': 'Sin anuncios',
    'dangerZone': 'Zona de riesgo',
    'logOut': 'Cerrar sesión',
    'logOutTitle': 'Cerrar sesión',
    'logOutConfirm': '¿Seguro que quieres cerrar sesión? Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.',
    'deleteAccountTitle': 'Eliminar cuenta',
    'deleteAccountConfirm': 'Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos los datos asociados.',
    'loggedOutSuccess': 'Sesión cerrada correctamente',
    'languageChangedEn': 'Idioma cambiado a inglés',
    'languageChangedEs': 'Idioma cambiado a español',
    'accountDeletionNotImplemented': 'Eliminación de cuenta aún no implementada',
    'selectLanguage': 'Elige tu idioma preferido',
    'goAdFreeTitle': 'Sin anuncios',
    'goAdFreeDesc': 'Para dejar de ver anuncios en clases gratuitas y en la aplicación, se requiere un pago único de 9,99 $. No volverás a ver anuncios después de esta compra.',
    'oneTimePayment': 'Pago único',
    'noSubscription': 'Sin suscripción. Paga una vez, disfruta sin anuncios para siempre.',
    'processing': 'Procesando...',
    'payAmount': 'Pagar 9,99 $',
    'adFreeSuccess': '¡Ya tienes experiencia sin anuncios!',
    'paymentFailed': 'El pago falló. Inténtalo de nuevo.',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to English
    const saved = localStorage.getItem('app_language');
    return (saved === 'es' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('app_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const langMap = translations[language];
    return langMap[key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
