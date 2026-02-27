import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const settingsEn = {
  title: 'Settings',
  subtitle: 'Manage your venue settings',
  venueInfo: 'Venue Information',
  venueDesc: 'Update your venue details',
  venueName: 'Venue Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  save: 'Save Changes',
  language: 'Language',
  languageDesc: 'Portal display language',
  en: 'English',
  es: 'Español',
};

const settingsEs = {
  title: 'Configuración',
  subtitle: 'Administra la configuración de tu venue',
  venueInfo: 'Información del venue',
  venueDesc: 'Actualiza los datos de tu venue',
  venueName: 'Nombre del venue',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  address: 'Dirección',
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
          <CardTitle>{t.venueInfo}</CardTitle>
          <CardDescription>{t.venueDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.venueName}</Label>
            <Input placeholder={t.venueName} defaultValue="Sample Restaurant" />
          </div>
          <div className="space-y-2">
            <Label>{t.email}</Label>
            <Input type="email" placeholder="venue@ulikme.com" defaultValue="venue@ulikme.com" />
          </div>
          <div className="space-y-2">
            <Label>{t.phone}</Label>
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label>{t.address}</Label>
            <Input placeholder={t.address} />
          </div>
          <Button>{t.save}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
