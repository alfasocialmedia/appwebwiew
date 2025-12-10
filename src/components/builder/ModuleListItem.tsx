'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ModuleConfig, MODULE_METADATA } from '@/types/layout';
import { GripVertical, Eye, EyeOff } from 'lucide-react';

interface ModuleListItemProps {
    module: ModuleConfig;
    isSelected: boolean;
    onSelect: () => void;
    onToggle: () => void;
}

export function ModuleListItem({ module, isSelected, onSelect, onToggle }: ModuleListItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const metadata = MODULE_METADATA[module.type];
    const isRequired = metadata.required;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
                ${!module.enabled ? 'opacity-60' : ''}
            `}
            onClick={onSelect}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-6 w-6" />
            </button>

            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <metadata.Icon className="h-6 w-6 text-slate-700" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base text-slate-900 truncate">
                        {metadata.label}
                    </h4>
                    {isRequired && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-semibold flex-shrink-0">
                            Requerido
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                    {metadata.description}
                </p>
            </div>

            {/* Toggle Visibility */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                disabled={isRequired}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-colors ${isRequired
                        ? 'opacity-30 cursor-not-allowed'
                        : module.enabled
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-400 hover:bg-slate-100'
                    }`}
                title={isRequired ? 'Este módulo es requerido' : module.enabled ? 'Ocultar módulo' : 'Mostrar módulo'}
            >
                {module.enabled ? (
                    <Eye className="h-5 w-5" />
                ) : (
                    <EyeOff className="h-5 w-5" />
                )}
            </button>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-500 rounded-r" />
            )}
        </div>
    );
}
