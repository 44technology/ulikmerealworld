import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const settingsEn = {
  title: 'Settings',
  subtitle: 'Manage your instructor settings',
  language: 'Language',
  languageDesc: 'Portal display language',
  en: 'English',
  es: 'Español',
  profile: 'Profile Information',
  profileDesc: 'Update your instructor profile',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  bio: 'Bio',
  save: 'Save Changes',
};

const settingsEs = {
  title: 'Configuración',
  subtitle: 'Administra la configuración de instructor',
  language: 'Idioma',
  languageDesc: 'Idioma de la interfaz del portal',
  en: 'English',
  es: 'Español',
  profile: 'Información del perfil',
  profileDesc: 'Actualiza tu perfil de instructor',
  name: 'Nombre',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  bio: 'Biografía',
  save: 'Guardar cambios',
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
          <CardTitle>{t.profile}</CardTitle>
          <CardDescription>{t.profileDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.name}</Label>
            <Input placeholder={t.name} defaultValue="Instructor" />
          </div>
          <div className="space-y-2">
            <Label>{t.email}</Label>
            <Input type="email" placeholder="instructor@ulikme.com" defaultValue="instructor@ulikme.com" />
          </div>
          <div className="space-y-2">
            <Label>{t.phone}</Label>
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label>{t.bio}</Label>
            <Input placeholder={t.bio} />
          </div>
          <Button>{t.save}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
