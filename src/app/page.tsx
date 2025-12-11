'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Smartphone, Radio, Loader2, Upload, Plus, Trash2, Facebook, Instagram, MessageCircle, ChevronDown, Play, Pause, Globe, ExternalLink, Power, ListMusic, MonitorPlay, Youtube } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter, FaGlobe } from 'react-icons/fa6';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LayoutBuilder from '@/components/builder/LayoutBuilder';

export default function AdminDashboard() {
  const [radios, setRadios] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<string>('default');
  const [newRadioName, setNewRadioName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch Radios List
  useEffect(() => {
    fetch('/api/radios')
      .then(res => res.json())
      .then(data => {
        if (data.radios) setRadios(data.radios);
      });
  }, []);

  // Fetch Config when radio changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/config?subdomain=${selectedRadio}`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure new fields exist if loading old config
        if (!data.social) data.social = [];
        if (!data.banners) data.banners = [];
        if (!data.bannerRotationSeconds) data.bannerRotationSeconds = 10;
        if (!data.theme.backgroundEffect) data.theme.backgroundEffect = { blur: 0, opacity: 1, movement: false };
        if (!data.programs) data.programs = [];
        setConfig(data);
        setLoading(false);
      });
  }, [selectedRadio]);

  const handleCreateRadio = async () => {
    if (!newRadioName) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/radios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRadioName })
      });
      const data = await res.json();
      if (data.success) {
        setRadios([...radios, data.name]);
        setSelectedRadio(data.name);
        setNewRadioName('');
        alert(`Radio ${data.name} creada!`);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error creando radio');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/config?subdomain=${selectedRadio}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    alert('Configuración guardada!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background' | 'banner', bannerIndex?: number) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        if (type === 'banner' && bannerIndex !== undefined) {
          const newBanners = [...(config.banners || [])];
          newBanners[bannerIndex].imageUrl = data.url;
          setConfig({ ...config, banners: newBanners });
        } else {
          setConfig((prev: any) => ({
            ...prev,
            theme: {
              ...prev.theme,
              [type === 'logo' ? 'logoUrl' : 'backgroundImageUrl']: data.url
            }
          }));
        }
      }
    } catch (err) {
      alert('Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  const addSocial = () => {
    setConfig({
      ...config,
      social: [...config.social, { platform: 'facebook', url: '', active: true }]
    });
  };

  const removeSocial = (index: number) => {
    const newSocial = [...config.social];
    newSocial.splice(index, 1);
    setConfig({ ...config, social: newSocial });
  };

  const updateSocial = (index: number, field: string, value: any) => {
    const newSocial = [...config.social];
    newSocial[index] = { ...newSocial[index], [field]: value };
    setConfig({ ...config, social: newSocial });
  };

  if (loading && !config) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between sticky top-0 z-50 bg-slate-50/80 backdrop-blur-sm py-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Radio Admin Panel</h1>
            <p className="text-slate-500">Gestiona tu aplicación en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select value={selectedRadio} onValueChange={setSelectedRadio}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Radio" />
                </SelectTrigger>
                <SelectContent>
                  {radios.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Nueva Radio..."
                className="w-32"
                value={newRadioName}
                onChange={e => setNewRadioName(e.target.value)}
              />
              <Button size="icon" variant="outline" onClick={handleCreateRadio} disabled={isCreating}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className={activeTab === 'builder' ? '' : 'grid gap-8 lg:grid-cols-2'}>
            {/* Editor Form */}
            <div className="space-y-6">
              {/* Tabs Navigation */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200 sticky top-20 bg-slate-50 z-40 pt-2">
                {[
                  { id: 'info', label: 'Información' },
                  { id: 'theme', label: 'Apariencia' },
                  { id: 'content', label: 'Contenido' },
                  { id: 'social', label: 'Social & Footer' },
                  { id: 'builder', label: 'Constructor Visual' }
                ].map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="transition-all"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
              <div className={activeTab === 'info' ? 'block' : 'hidden'}>
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Emisora ({selectedRadio})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Radio</Label>
                      <Input value={config.stationName} onChange={(e) => setConfig({ ...config, stationName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slogan</Label>
                      <Input value={config.slogan} onChange={(e) => setConfig({ ...config, slogan: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>URL del Stream</Label>
                      <Input value={config.streamUrl} onChange={(e) => setConfig({ ...config, streamUrl: e.target.value })} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'theme' ? 'block' : 'hidden'}>
                <Card>
                  <CardHeader>
                    <CardTitle>Apariencia y Fondo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Plantilla de Diseño</Label>
                        <Select
                          value={config.template || 'classic'}
                          onValueChange={(value) => setConfig({ ...config, template: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Clásica (Original)</SelectItem>
                            <SelectItem value="card">Tarjeta (Estilo App)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Autor (Splash Screen)</Label>
                        <Input
                          placeholder="Ej: Desarrollado por..."
                          value={config.splashAuthor || ''}
                          onChange={(e) => setConfig({ ...config, splashAuthor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Color Primario</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 p-1" value={config.theme.primaryColor} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })} />
                          <Input value={config.theme.primaryColor} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color Fondo (Sólido)</Label>
                        <div className="flex gap-2">
                          <Input value={config.theme.backgroundColor} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, backgroundColor: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color Texto (General)</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 p-1" value={config.theme.textColor || '#ffffff'} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, textColor: e.target.value } })} />
                          <Input value={config.theme.textColor || '#ffffff'} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, textColor: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Logo de la Emisora</Label>
                      <div className="flex gap-2">
                        <Input value={config.theme.logoUrl} readOnly />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800">
                            <Upload className="h-4 w-4" />
                          </div>
                          <Input id="logo-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Imagen de Fondo (Opcional)</Label>
                      <div className="flex gap-2">
                        <Input value={config.theme.backgroundImageUrl || ''} readOnly placeholder="Sin imagen de fondo" />
                        <Label htmlFor="bg-upload" className="cursor-pointer">
                          <div className="flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800">
                            <Upload className="h-4 w-4" />
                          </div>
                          <Input id="bg-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'background')} />
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium">Efectos de Fondo</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Desenfoque (Blur)</Label>
                          <span className="text-xs text-slate-500">{config.theme.backgroundEffect?.blur || 0}px</span>
                        </div>
                        <Input
                          type="range" min="0" max="20"
                          value={config.theme.backgroundEffect?.blur || 0}
                          onChange={(e) => setConfig({ ...config, theme: { ...config.theme, backgroundEffect: { ...config.theme.backgroundEffect, blur: parseInt(e.target.value) } } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Opacidad Imagen</Label>
                          <span className="text-xs text-slate-500">{config.theme.backgroundEffect?.opacity || 1}</span>
                        </div>
                        <Input
                          type="range" min="0" max="1" step="0.1"
                          value={config.theme.backgroundEffect?.opacity || 1}
                          onChange={(e) => setConfig({ ...config, theme: { ...config.theme, backgroundEffect: { ...config.theme.backgroundEffect, opacity: parseFloat(e.target.value) } } })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Movimiento Suave</Label>
                        <Switch
                          checked={config.theme.backgroundEffect?.movement || false}
                          onCheckedChange={(c) => setConfig({ ...config, theme: { ...config.theme, backgroundEffect: { ...config.theme.backgroundEffect, movement: c } } })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sombra Oscura (Gradiente)</Label>
                        <Switch
                          checked={config.theme.backgroundEffect?.gradient !== false}
                          onCheckedChange={(c) => setConfig({ ...config, theme: { ...config.theme, backgroundEffect: { ...config.theme.backgroundEffect, gradient: c } } })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'social' ? 'block' : 'hidden space-y-6'}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Redes Sociales</CardTitle>
                    <Button size="sm" variant="outline" onClick={addSocial}><Plus className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config.social.map((social: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                        <select
                          className="h-9 rounded-md border bg-transparent px-2 text-sm"
                          value={social.platform}
                          onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="twitter">Twitter</option>
                          <option value="youtube">YouTube</option>
                          <option value="website">Web</option>
                        </select>
                        <Input
                          placeholder="URL..."
                          value={social.url}
                          onChange={(e) => updateSocial(index, 'url', e.target.value)}
                        />
                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeSocial(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>


              </div>

              <div className={activeTab === 'content' ? 'block' : 'hidden space-y-6'}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Banners Publicitarios</span>
                      <Button size="sm" onClick={() => {
                        const newBanners = [...(config.banners || []), {
                          imageUrl: '',
                          url: '',
                          type: 'standard',
                          contentType: 'image',
                          htmlContent: ''
                        }];
                        setConfig({ ...config, banners: newBanners });
                      }}>
                        <Plus className="h-4 w-4 mr-2" /> Agregar
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Agrega imágenes que rotarán automáticamente en el reproductor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duración mostrada (segundos) - Opcional</Label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        placeholder="Dejar vacío para ocultar banners"
                        value={config.bannerRotationSeconds || ''}
                        onChange={(e) => setConfig({ ...config, bannerRotationSeconds: e.target.value ? parseInt(e.target.value) : 0 })}
                      />
                      <p className="text-xs text-slate-500">Si es 0 o vacío, no se mostrarán banners</p>
                    </div>

                    {(!config.banners || config.banners.length === 0) && (
                      <p className="text-sm text-slate-500">No hay banners configurados</p>
                    )}

                    {config.banners?.map((banner: any, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border p-4 relative">
                        {/* Configuration Column */}
                        <div className="md:col-span-2 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-semibold">Banner {index + 1}</Label>
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => {
                              const newBanners = config.banners.filter((_: any, i: number) => i !== index);
                              setConfig({ ...config, banners: newBanners });
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Type and Content Selectors */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Tipo de Banner</Label>
                              <Select
                                value={banner.type || 'standard'}
                                onValueChange={(value) => {
                                  const newBanners = [...config.banners];
                                  newBanners[index].type = value;
                                  setConfig({ ...config, banners: newBanners });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Estándar (1080x48px)</SelectItem>
                                  <SelectItem value="fullscreen">Pantalla Completa (1080x1350px)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Formato</Label>
                              <Select
                                value={banner.contentType || 'image'}
                                onValueChange={(value) => {
                                  const newBanners = [...config.banners];
                                  newBanners[index].contentType = value;
                                  setConfig({ ...config, banners: newBanners });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="image">Imagen</SelectItem>
                                  <SelectItem value="html">HTML</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Content based on type */}
                          {banner.contentType === 'html' ? (
                            <div className="space-y-2">
                              <Label>Código HTML</Label>
                              <textarea
                                value={banner.htmlContent || ''}
                                onChange={(e) => {
                                  const newBanners = [...config.banners];
                                  newBanners[index].htmlContent = e.target.value;
                                  setConfig({ ...config, banners: newBanners });
                                }}
                                className="w-full h-32 p-2 border rounded font-mono text-xs"
                                placeholder="<div>Tu código HTML aquí...</div>"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>Imagen</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={banner.imageUrl}
                                  readOnly
                                  placeholder="Sube una imagen"
                                />
                                <Label htmlFor={`banner-upload-${index}`} className="cursor-pointer">
                                  <div className="flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800">
                                    <Upload className="h-4 w-4" />
                                  </div>
                                  <Input
                                    id={`banner-upload-${index}`}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'banner', index)}
                                  />
                                </Label>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>URL destino (opcional)</Label>
                            <Input
                              value={banner.url || ''}
                              onChange={(e) => {
                                const newBanners = [...config.banners];
                                newBanners[index].url = e.target.value;
                                setConfig({ ...config, banners: newBanners });
                              }}
                              placeholder="https://ejemplo.com"
                            />
                          </div>

                          {/* Frequency for Fullscreen Banners */}
                          {banner.type === 'fullscreen' && (
                            <div className="space-y-2">
                              <Label>Frecuencia (minutos)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={banner.frequency || ''}
                                onChange={(e) => {
                                  const newBanners = [...config.banners];
                                  newBanners[index].frequency = parseInt(e.target.value) || 0;
                                  setConfig({ ...config, banners: newBanners });
                                }}
                                placeholder="0 = Rotación normal"
                              />
                              <p className="text-[10px] text-slate-500">
                                0: Rota cada 2 ciclos. X: Muestra este banner solo cada X minutos.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Preview Column */}
                        <div className="md:col-span-1 border-l pl-4 flex flex-col items-center">
                          <Label className="mb-2 text-xs font-semibold uppercase text-slate-500">Vista Previa</Label>
                          <div className={`
                          relative overflow-hidden border rounded bg-slate-100 flex items-center justify-center
                          ${banner.type === 'fullscreen' ? 'w-[180px] h-[300px]' : 'w-full h-[70px]'}
                        `}>
                            {banner.contentType === 'html' ? (
                              <div className="w-full h-full overflow-hidden bg-white relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="origin-center scale-[0.3] w-[300%] h-[300%] flex items-center justify-center">
                                    <div dangerouslySetInnerHTML={{ __html: banner.htmlContent || '' }} />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              banner.imageUrl ? (
                                <img
                                  src={banner.imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-slate-400 text-xs">Sin imagen</span>
                              )
                            )}

                            {/* Overlay badge for type */}
                            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded">
                              {banner.type === 'fullscreen' ? 'FULL' : 'STD'}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 text-center">
                            {banner.type === 'fullscreen'
                              ? 'Se mostrará como overlay modal (80% alto)'
                              : 'Recomendado: 320x70px'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'social' ? 'block' : 'hidden'}>
                <Card>
                  <CardHeader>
                    <CardTitle>Pie de Página</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Texto Principal</Label>
                        <Input
                          value={config.footerText || ''}
                          onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                          placeholder="© 2025 Mi Radio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Créditos / Extra (HTML opcional)</Label>
                        <Input
                          value={config.creditsText || ''}
                          onChange={(e) => setConfig({ ...config, creditsText: e.target.value })}
                          placeholder="Hecho por onradio.com.ar"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>


              </div>

              <div className={activeTab === 'content' ? 'block' : 'hidden'}>

                {/* Programs Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Programación (Lista de Programas)</CardTitle>
                      <CardDescription>Gestiona los programas que aparecen en la sección "Programación"</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => {
                      const newPrograms = [...(config.programs || []), {
                        id: Date.now().toString(),
                        title: '',
                        host: '',
                        time: '',
                        days: '',
                        photoUrl: ''
                      }];
                      setConfig({ ...config, programs: newPrograms });
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Agregar Recurso
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(!config.programs || config.programs.length === 0) && (
                      <p className="text-sm text-slate-500">No hay programas cargados.</p>
                    )}
                    {config.programs?.map((program: any, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border p-4 relative items-start">
                        {/* Photo Column */}
                        <div className="md:col-span-1 flex flex-col items-center gap-2">
                          <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
                            {program.photoUrl ? (
                              <img src={program.photoUrl} alt="Program" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-slate-400">Sin foto</span>
                            )}
                          </div>
                          <Label htmlFor={`prog-upload-${index}`} className="cursor-pointer w-full">
                            <div className="flex px-2 py-1 items-center justify-center rounded-md bg-slate-900 text-white text-xs hover:bg-slate-800">
                              <Upload className="h-3 w-3 mr-1" /> Subir Foto
                            </div>
                            <Input
                              id={`prog-upload-${index}`}
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                if (!e.target.files?.[0]) return;
                                setUploading(true);
                                const formData = new FormData();
                                formData.append('file', e.target.files[0]);
                                try {
                                  const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                  const data = await res.json();
                                  if (data.success) {
                                    const newPrograms = [...config.programs];
                                    newPrograms[index].photoUrl = data.url;
                                    setConfig({ ...config, programs: newPrograms });
                                  }
                                } catch (err) { alert('Error subiendo imagen'); }
                                finally { setUploading(false); }
                              }}
                            />
                          </Label>
                        </div>

                        {/* Fields Column */}
                        <div className="md:col-span-3 space-y-3">
                          <div className="flex justify-between">
                            <Label className="font-bold text-xs uppercase text-slate-500">Programa #{index + 1}</Label>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => {
                              const newPrograms = config.programs.filter((_: any, i: number) => i !== index);
                              setConfig({ ...config, programs: newPrograms });
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Nombre del Programa</Label>
                              <Input
                                className="h-8 text-sm"
                                placeholder="Ej: La mañana de la radio"
                                value={program.title}
                                onChange={(e) => {
                                  const newPrograms = [...config.programs];
                                  newPrograms[index].title = e.target.value;
                                  setConfig({ ...config, programs: newPrograms });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Conductor / Locutor</Label>
                              <Input
                                className="h-8 text-sm"
                                placeholder="Ej: Juan Perez"
                                value={program.host}
                                onChange={(e) => {
                                  const newPrograms = [...config.programs];
                                  newPrograms[index].host = e.target.value;
                                  setConfig({ ...config, programs: newPrograms });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Días</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, dIndex) => {
                                  const currentDays = program.days ? program.days.split(',').map((d: string) => d.trim()) : [];
                                  const isSelected = currentDays.includes(day);
                                  return (
                                    <div
                                      key={day}
                                      onClick={() => {
                                        const newPrograms = [...config.programs];
                                        let newDaysList = [...currentDays];
                                        if (isSelected) {
                                          newDaysList = newDaysList.filter(d => d !== day);
                                        } else {
                                          newDaysList.push(day);
                                          // Sort days based on week order
                                          const weekOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                                          newDaysList.sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
                                        }
                                        newPrograms[index].days = newDaysList.join(',');
                                        setConfig({ ...config, programs: newPrograms });
                                      }}
                                      className={`w-6 h-6 text-[10px] rounded-full flex items-center justify-center border cursor-pointer transition-colors ${isSelected
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                      title={day}
                                    >
                                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'][dIndex]}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Horario</Label>
                              <Input
                                className="h-8 text-sm"
                                placeholder="Ej: 09:00 - 12:00"
                                value={program.time}
                                onChange={(e) => {
                                  const newPrograms = [...config.programs];
                                  newPrograms[index].time = e.target.value;
                                  setConfig({ ...config, programs: newPrograms });
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1 mt-2">
                            <Label className="text-xs">WhatsApp / Contacto</Label>
                            <Input
                              className="h-8 text-sm"
                              placeholder="Ej: 54911..."
                              value={program.contact || ''}
                              onChange={(e) => {
                                const newPrograms = [...config.programs];
                                newPrograms[index].contact = e.target.value;
                                setConfig({ ...config, programs: newPrograms });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Videos Configuration */}
              <div className={`space-y-4 mb-8 ${activeTab === 'content' ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Videos</h2>
                  </div>
                  <Button
                    onClick={() => {
                      const newVideos = [...(config.videos || [])];
                      newVideos.push({ title: '', url: '' });
                      setConfig({ ...config, videos: newVideos });
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Agregar Video
                  </Button>
                </div>

                <Card className="border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    {(!config.videos || config.videos.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No hay videos configurados.
                      </div>
                    )}
                    {config.videos?.map((video: any, index: number) => (
                      <div
                        key={index}
                        className="group relative rounded-lg border bg-white p-4 transition-all hover:shadow-md"
                      >
                        <div className="grid gap-4">
                          <div className="flex items-start justify-between">
                            <div className="grid w-full gap-4">
                              <div className="space-y-1">
                                <Label className="text-xs">Título del Video</Label>
                                <Input
                                  className="h-8 text-sm"
                                  placeholder="Ej: Entrevista Exclusiva"
                                  value={video.title}
                                  onChange={(e) => {
                                    const newVideos = [...config.videos];
                                    newVideos[index].title = e.target.value;
                                    setConfig({ ...config, videos: newVideos });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">URL de YouTube</Label>
                                <Input
                                  className="h-8 text-sm"
                                  placeholder="Ej: https://youtube.com/..."
                                  value={video.url}
                                  onChange={(e) => {
                                    const newVideos = [...config.videos];
                                    newVideos[index].url = e.target.value;
                                    setConfig({ ...config, videos: newVideos });
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-500 -mt-1 -mr-2"
                              onClick={() => {
                                const newVideos = [...config.videos];
                                newVideos.splice(index, 1);
                                setConfig({ ...config, videos: newVideos });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Constructor Visual Tab */}
              <div className={activeTab === 'builder' ? 'block' : 'hidden'}>
                <LayoutBuilder
                  config={config}
                  onUpdate={(layout) => {
                    setConfig({ ...config, layout });
                    // Auto-save when layout changes
                    handleSave();
                  }}
                />
              </div>
            </div>

            {/* Right Column - Live Preview (Hidden when in Builder tab) */}
            {activeTab !== 'builder' && (
              <div className="sticky top-24 h-fit">
                <Card className="border-slate-200 bg-slate-100 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" /> Vista Previa App
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-xs"
                          onClick={() => {
                            const url = `${window.location.protocol}//${window.location.host}/public-player/${selectedRadio}`;
                            alert(`
CONFIGURACIÓN DE APP MÓVIL
------------------------------------------------
Para generar tu aplicación Android/iOS, usa esta URL en tu WebView:

URL: ${url}

1. Abre el proyecto en Android Studio / Xcode
2. Busca el archivo de configuración (App.tsx o Config.js)
3. Reemplaza la URL existente por la de arriba
4. Genera el APK / IPA
                          `);
                          }}
                        >
                          <Radio className="h-3 w-3" /> Datos App
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-xs"
                          onClick={() => window.open(`/public-player/${selectedRadio}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" /> Abrir
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center p-8">
                    {/* Phone Frame */}
                    <div
                      className="relative h-[640px] w-[320px] overflow-hidden rounded-[3rem] border-8 border-slate-900 shadow-2xl"
                      style={{ backgroundColor: config.theme.backgroundColor }}
                    >
                      {/* Background Image Layer */}
                      {config.theme.backgroundImageUrl && (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                          style={{
                            backgroundImage: `url(${config.theme.backgroundImageUrl})`,
                            opacity: config.theme.backgroundEffect?.opacity || 1,
                            filter: `blur(${config.theme.backgroundEffect?.blur || 0}px)`,
                            transform: config.theme.backgroundEffect?.movement ? 'scale(1.1)' : 'scale(1)'
                          }}
                        />
                      )}

                      {/* Notch */}
                      <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-xl bg-slate-900"></div>

                      {/* App Content */}
                      <div className="relative z-10 flex h-full flex-col justify-between text-white p-4">
                        {config.template === 'card' ? (
                          // === CARD TEMPLATE PREVIEW ===
                          <div className="flex flex-col h-full items-center justify-center gap-4">
                            {/* Exit Button Preview */}
                            <div className="absolute right-2 top-2 p-2 opacity-50">
                              <Power className="h-4 w-4 text-white" />
                            </div>

                            {/* Logo con fondo blanco */}
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                              <img
                                src={config.theme.logoUrl}
                                alt="Station Logo"
                                className="w-20 h-20 object-contain"
                              />
                            </div>

                            {/* Station Info */}
                            <div className="text-center space-y-1">
                              <h2 className="text-base font-bold drop-shadow-lg">{config.stationName}</h2>
                              <p className="text-xs opacity-90 drop-shadow-md">{config.slogan}</p>
                            </div>

                            {/* Play Button - Cyan */}
                            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-xl">
                              <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                            </div>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2 w-full max-w-[200px]">
                              <svg className="h-3 w-3 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <div className="flex-1 h-1 bg-white/20 rounded-full">
                                <div className="h-full w-2/3 bg-white rounded-full"></div>
                              </div>
                              <svg className="h-3 w-3 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-3">
                              {config.social.slice(0, 4).map((s: any, i: number) => (
                                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                  {s.platform === 'facebook' && <FaFacebook className="h-4 w-4 text-white" />}
                                  {s.platform === 'instagram' && <FaInstagram className="h-4 w-4 text-white" />}
                                  {s.platform === 'whatsapp' && <FaWhatsapp className="h-4 w-4 text-white" />}
                                  {s.platform === 'twitter' && <FaXTwitter className="h-4 w-4 text-white" />}
                                  {s.platform === 'website' && <FaGlobe className="h-4 w-4 text-white" />}
                                  {!['facebook', 'instagram', 'whatsapp', 'twitter', 'website'].includes(s.platform) && <span className="text-[10px] uppercase font-bold text-white">{s.platform[0]}</span>}
                                </div>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="text-center space-y-1 mt-2">
                              <p className="text-[10px] opacity-60">{config.footerText}</p>
                              {config.creditsText && (
                                <p className="text-[8px] opacity-40">{config.creditsText}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          // === CLASSIC TEMPLATE PREVIEW ===
                          <div className="flex flex-col h-full items-center justify-center p-2 pb-4 text-white overflow-hidden gap-6">
                            {/* Main Content Group */}
                            <div className="flex flex-col items-center justify-center w-full gap-4 min-h-0">
                              {/* Header con Logo */}
                              <div className="flex w-full flex-col items-center relative flex-shrink-0">
                                <div className="absolute right-0 top-0 p-2 opacity-80">
                                  <Power className="h-5 w-5 text-white" />
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-xl mb-3">
                                  <img
                                    src={config.theme.logoUrl}
                                    alt="Logo"
                                    className="h-20 w-20 object-contain"
                                  />
                                </div>
                                <h2 className="text-center text-xl font-bold drop-shadow-xl truncate w-full px-2">{config.stationName}</h2>
                                <p className="text-center text-sm opacity-90 drop-shadow-lg">{config.slogan}</p>
                              </div>

                              {/* Player Controls */}
                              <div className="w-full flex justify-center flex-shrink-0">
                                <div
                                  className="flex h-12 w-12 items-center justify-center rounded-full shadow-xl"
                                  style={{ backgroundColor: config.theme.primaryColor }}
                                >
                                  <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                                </div>
                              </div>
                            </div>

                            {/* Social & Footer */}
                            <div className="flex w-full flex-col items-center gap-2 flex-shrink-0">
                              <div className="flex gap-3">
                                {config.social.slice(0, 5).map((s: any, i: number) => (
                                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    {s.platform === 'facebook' && <FaFacebook className="h-4 w-4" />}
                                    {s.platform === 'instagram' && <FaInstagram className="h-4 w-4" />}
                                    {s.platform === 'whatsapp' && <FaWhatsapp className="h-4 w-4" />}
                                    {s.platform === 'twitter' && <FaXTwitter className="h-4 w-4" />}
                                    {s.platform === 'website' && <FaGlobe className="h-4 w-4" />}
                                    {!['facebook', 'instagram', 'whatsapp', 'twitter', 'website'].includes(s.platform) && <span className="text-[10px] uppercase font-bold">{s.platform[0]}</span>}
                                  </div>
                                ))}
                              </div>

                              {/* Footer Texts */}
                              <div className="flex flex-col items-center gap-0 w-full">
                                <p className="text-center text-[10px] opacity-60 m-0 leading-tight">{config.footerText}</p>
                                {config.creditsText && (
                                  <div className="text-center text-[8px] opacity-40 m-0 leading-tight">Credits...</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
