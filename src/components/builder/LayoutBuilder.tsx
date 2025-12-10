'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModuleConfig, PlayerLayout, DEFAULT_LAYOUT, MODULE_METADATA, FontSize } from '@/types/layout';
import { PhonePreview } from './PhonePreview';
import { ModuleListItem } from './ModuleListItem';
import { RotateCcw, Save, ArrowUp, ArrowDown, Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LayoutBuilderProps {
    config: any;
    onUpdate: (layout: PlayerLayout) => void;
}

export default function LayoutBuilder({ config, onUpdate }: LayoutBuilderProps) {
    const [modules, setModules] = useState<ModuleConfig[]>(
        config.layout?.modules || DEFAULT_LAYOUT.modules
    );
    const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                return newItems.map((item, index) => ({ ...item, order: index }));
            });
        }
    };

    const handleToggleModule = (id: string) => {
        setModules((items) =>
            items.map((item) =>
                item.id === id ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const handleUpdateSettings = (id: string, settings: any) => {
        setModules((items) =>
            items.map((item) =>
                item.id === id ? { ...item, settings: { ...item.settings, ...settings } } : item
            )
        );
    };

    const handleReset = () => {
        setModules(DEFAULT_LAYOUT.modules);
        setSelectedModule(null);
    };

    const handleSave = () => {
        const layout: PlayerLayout = {
            modules,
            globalSpacing: 4
        };
        onUpdate(layout);
    };

    const activeModule = activeId ? modules.find(m => m.id === activeId) : null;
    const metadata = selectedModule ? MODULE_METADATA[selectedModule.type] : null;
    const isTextModule = selectedModule && ['title', 'slogan', 'footer'].includes(selectedModule.type);

    return (
        <div className="space-y-8">
            {/* Top Section - Constructor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Header */}
                <div className="px-10 py-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Constructor Visual</h2>
                            <p className="text-sm text-slate-500 mt-1.5">Personaliza el diseño de tu reproductor</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleReset} size="default">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restablecer
                            </Button>
                            <Button onClick={handleSave} size="default" className="bg-blue-600 hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Grid: Modules + Properties | Preview */}
                <div className="p-10">
                    <div className="grid grid-cols-12 gap-10">
                        {/* Left Side: Modules + Properties (7 columns) */}
                        <div className="col-span-7 grid grid-cols-2 gap-10">
                            {/* Module List */}
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-1">Módulos del Reproductor</h3>
                                    <p className="text-xs text-slate-500">Arrastra para reordenar</p>
                                </div>

                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={modules.map((m) => m.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {modules.map((module) => (
                                                <ModuleListItem
                                                    key={module.id}
                                                    module={module}
                                                    isSelected={selectedModule?.id === module.id}
                                                    onSelect={() => setSelectedModule(module)}
                                                    onToggle={() => handleToggleModule(module.id)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                    <DragOverlay>
                                        {activeModule ? (
                                            <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-blue-500">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        {(() => {
                                                            const IconComponent = MODULE_METADATA[activeModule.type].Icon;
                                                            return <IconComponent className="h-5 w-5" />;
                                                        })()}
                                                    </div>
                                                    <span className="font-semibold text-sm">{MODULE_METADATA[activeModule.type].label}</span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            </div>

                            {/* Properties Panel */}
                            <div>
                                {selectedModule && metadata ? (
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                {(() => {
                                                    const IconComponent = metadata.Icon;
                                                    return <IconComponent className="h-8 w-8 text-white" />;
                                                })()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{metadata.label}</h3>
                                                <p className="text-sm text-slate-500">{metadata.description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-7 max-h-[600px] overflow-y-auto pr-2">
                                            {/* Tamaño */}
                                            <div>
                                                <Label className="text-xs font-bold mb-3 block text-slate-700 uppercase tracking-wider">Tamaño</Label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['sm', 'md', 'lg', 'xl'].map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() => handleUpdateSettings(selectedModule.id, { size })}
                                                            className={`px-3 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${selectedModule.settings.size === size
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {size.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tamaño de Fuente */}
                                            {isTextModule && (
                                                <div>
                                                    <Label className="text-xs font-bold mb-3 block text-slate-700 uppercase tracking-wider">Fuente</Label>
                                                    <Select
                                                        value={selectedModule.settings.fontSize || 'base'}
                                                        onValueChange={(value) => handleUpdateSettings(selectedModule.id, { fontSize: value as FontSize })}
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="xs">Extra Pequeño</SelectItem>
                                                            <SelectItem value="sm">Pequeño</SelectItem>
                                                            <SelectItem value="base">Normal</SelectItem>
                                                            <SelectItem value="lg">Grande</SelectItem>
                                                            <SelectItem value="xl">Extra Grande</SelectItem>
                                                            <SelectItem value="2xl">2X Grande</SelectItem>
                                                            <SelectItem value="3xl">3X Grande</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {/* Alineación */}
                                            <div>
                                                <Label className="text-xs font-bold mb-3 block text-slate-700 uppercase tracking-wider">Alineación</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { value: 'left', label: 'Izq' },
                                                        { value: 'center', label: 'Centro' },
                                                        { value: 'right', label: 'Der' }
                                                    ].map((alignment) => (
                                                        <button
                                                            key={alignment.value}
                                                            onClick={() => handleUpdateSettings(selectedModule.id, { alignment: alignment.value })}
                                                            className={`px-3 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${selectedModule.settings.alignment === alignment.value
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {alignment.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Margen Superior */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label className="text-xs font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                                                        <ArrowUp className="h-4 w-4" />
                                                        Superior
                                                    </Label>
                                                    <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                        {selectedModule.settings.marginTop || 0}
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[selectedModule.settings.marginTop || 0]}
                                                    onValueChange={(value) => handleUpdateSettings(selectedModule.id, { marginTop: value[0] })}
                                                    min={0}
                                                    max={12}
                                                    step={1}
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* Margen Inferior */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Label className="text-xs font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                                                        <ArrowDown className="h-4 w-4" />
                                                        Inferior
                                                    </Label>
                                                    <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                        {selectedModule.settings.marginBottom || 0}
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[selectedModule.settings.marginBottom || 0]}
                                                    onValueChange={(value) => handleUpdateSettings(selectedModule.id, { marginBottom: value[0] })}
                                                    min={0}
                                                    max={12}
                                                    step={1}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full min-h-[300px]">
                                        <div className="text-center">
                                            <Smartphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <h3 className="font-semibold text-base text-slate-700 mb-1">Selecciona un Módulo</h3>
                                            <p className="text-xs text-slate-500">Haz clic en un módulo para editar</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Preview ONLY (5 columns) */}
                        <div className="col-span-5">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 h-full flex flex-col min-h-[700px]">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
                                        <Smartphone className="h-4 w-4" />
                                        Vista Previa en Tiempo Real
                                    </div>
                                </div>
                                <div className="flex items-center justify-center flex-1">
                                    <div className="transform scale-75">
                                        <PhonePreview
                                            modules={modules}
                                            config={config}
                                            globalSpacing={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
