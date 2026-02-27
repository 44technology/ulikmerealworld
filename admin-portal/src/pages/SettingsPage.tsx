import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const settingsEn = {
  title: 'Settings',
  subtitle: 'Manage platform settings',
  platform: 'Platform Settings',
  platformDesc: 'Configure platform-wide settings',
  platformName: 'Platform Name',
  adminEmail: 'Admin Email',
  supportEmail: 'Support Email',
  save: 'Save Changes',
  language: 'Language',
  languageDesc: 'Portal display language',
  en: 'English',
  es: 'Español',
};

const settingsEs = {
  title: 'Configuración',
  subtitle: 'Administra la configuración de la plataforma',
  platform: 'Configuración de la plataforma',
  platformDesc: 'Configuración global de la plataforma',
  platformName: 'Nombre de la plataforma',
  adminEmail: 'Correo del administrador',
  supportEmail: 'Correo de soporte',
  save: 'Guardar cambios',
  language: 'Idioma',
  languageDesc: 'Idioma de la interfaz del portal',
  en: 'English',
  es: 'Español',
};

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const t = language === 'es' ? settingsEs : settingsEn;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.language}</CardTitle>
          <CardDescription>{t.languageDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.language}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'es')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t.en}</SelectItem>
                <SelectItem value="es">{t.es}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.platform}</CardTitle>
          <CardDescription>{t.platformDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.platformName}</Label>
            <Input placeholder="Ulikme" defaultValue="Ulikme" />
          </div>
          <div className="space-y-2">
            <Label>{t.adminEmail}</Label>
            <Input type="email" placeholder="admin@ulikme.com" defaultValue="admin@ulikme.com" />
          </div>
          <div className="space-y-2">
            <Label>{t.supportEmail}</Label>
            <Input type="email" placeholder="support@ulikme.com" />
          </div>
          <Button>{t.save}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
