'use client';

import { ModuleConfig } from '@/types/layout';
import { ModuleRenderer } from './ModuleRenderer';
import { Power } from 'lucide-react';

interface PhonePreviewProps {
    modules: ModuleConfig[];
    config: any;
    globalSpacing: number;
}

export function PhonePreview({ modules, config, globalSpacing }: PhonePreviewProps) {
    const enabledModules = modules
        .filter((m) => m.enabled)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="relative">
            {/* Phone Frame */}
            <div
                className="relative h-[680px] w-[340px] overflow-hidden rounded-[3rem] border-[14px] border-slate-900 shadow-2xl bg-slate-900"
                style={{ backgroundColor: config.theme?.backgroundColor || '#000' }}
            >
                {/* Background Image Layer */}
                {config.theme?.backgroundImageUrl && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                        style={{
                            backgroundImage: `url(${config.theme.backgroundImageUrl})`,
                            opacity: config.theme.backgroundEffect?.opacity || 1,
                            filter: `blur(${config.theme.backgroundEffect?.blur || 0}px)`,
                        }}
                    />
                )}

                {/* Gradient Overlay */}
                {config.theme?.backgroundEffect?.gradient !== false && (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                )}

                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-20 h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-slate-900"></div>

                {/* Exit Button */}
                <div className="absolute right-4 top-4 z-20 p-2 opacity-60 rounded-full bg-white/10">
                    <Power className="h-4 w-4 text-white" />
                </div>

                {/* App Content */}
                <div className="relative z-10 h-full overflow-y-auto text-white p-6 pt-12">
                    <div
                        className="flex flex-col items-center justify-center min-h-full"
                        style={{ gap: `${globalSpacing * 0.25}rem` }}
                    >
                        {enabledModules.map((module) => (
                            <div key={module.id} className="w-full">
                                <ModuleRenderer
                                    module={module}
                                    config={config}
                                    isPreview={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Phone Shadow */}
            <div className="absolute inset-0 rounded-[3rem] shadow-2xl pointer-events-none" />
        </div>
    );
}
