'use client';

import { ModuleConfig } from '@/types/layout';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter, FaGlobe } from 'react-icons/fa6';

interface ModuleRendererProps {
    module: ModuleConfig;
    config: any;
    isPreview?: boolean;
    isPlaying?: boolean;
    volume?: number;
    onTogglePlay?: () => void;
    onVolumeChange?: (volume: number) => void;
}

export function ModuleRenderer({
    module,
    config,
    isPreview = false,
    isPlaying = false,
    volume = 0.7,
    onTogglePlay,
    onVolumeChange,
}: ModuleRendererProps) {
    const { type, settings } = module;

    // Size mappings
    const sizeClasses = {
        logo: {
            sm: 'w-20 h-20',
            md: 'w-28 h-28',
            lg: 'w-32 h-32',
            xl: 'w-36 h-36',
        },
        title: {
            sm: 'text-base',
            md: 'text-xl',
            lg: 'text-2xl',
            xl: 'text-3xl',
        },
        slogan: {
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-lg',
        },
        playButton: {
            sm: 'h-12 w-12',
            md: 'h-16 w-16',
            lg: 'h-20 w-20',
            xl: 'h-24 w-24',
        },
        socialIcons: {
            sm: 'h-8 w-8',
            md: 'h-10 w-10',
            lg: 'h-12 w-12',
            xl: 'h-14 w-14',
        },
    };

    // Spacing mappings (deprecated - using margins now)
    const spacingClasses = {
        tight: 'my-1',
        normal: 'my-2',
        relaxed: 'my-4',
    };

    // Alignment mappings
    const alignmentClasses = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right',
    };

    // Font size mappings
    const fontSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
    };

    const spacing = spacingClasses[settings.spacing || 'normal'];
    const alignment = alignmentClasses[settings.alignment || 'center'];

    // Calculate margins
    const marginTop = settings.marginTop !== undefined ? `mt-${settings.marginTop}` : 'mt-0';
    const marginBottom = settings.marginBottom !== undefined ? `mb-${settings.marginBottom}` : 'mb-0';
    const margins = `${marginTop} ${marginBottom}`;

    switch (type) {
        case 'logo':
            const logoSize = sizeClasses.logo[settings.size || 'md'];
            return (
                <div className={`${margins} ${alignment} w-full flex flex-col`}>
                    <div className="bg-white rounded-3xl p-5 shadow-2xl">
                        <img
                            src={config.theme?.logoUrl || '/placeholder-logo.png'}
                            alt="Logo"
                            className={`${logoSize} object-contain`}
                        />
                    </div>
                </div>
            );

        case 'title':
            const titleSize = sizeClasses.title[settings.size || 'lg'];
            const titleFontSize = settings.fontSize ? fontSizeClasses[settings.fontSize] : '';
            return (
                <div className={`${margins} ${alignment} w-full`}>
                    <h1 className={`${titleFontSize || titleSize} font-bold drop-shadow-lg`}>
                        {config.stationName || 'Nombre de la Radio'}
                    </h1>
                </div>
            );

        case 'slogan':
            const sloganSize = sizeClasses.slogan[settings.size || 'sm'];
            const sloganFontSize = settings.fontSize ? fontSizeClasses[settings.fontSize] : '';
            return (
                <div className={`${margins} ${alignment} w-full`}>
                    <p className={`${sloganFontSize || sloganSize} opacity-90 drop-shadow-md`}>
                        {config.slogan || 'Tu eslogan aquí'}
                    </p>
                </div>
            );

        case 'playButton':
            const buttonSize = sizeClasses.playButton[settings.size || 'md'];
            const iconSize = settings.size === 'sm' ? 'h-6 w-6' : settings.size === 'lg' ? 'h-10 w-10' : settings.size === 'xl' ? 'h-12 w-12' : 'h-8 w-8';
            return (
                <div className={`${margins} ${alignment} w-full flex flex-col`}>
                    <button
                        onClick={isPreview ? undefined : onTogglePlay}
                        className={`flex ${buttonSize} items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 ${config.template === 'card' ? 'bg-cyan-500' : ''
                            }`}
                        style={{
                            backgroundColor: config.template === 'card' ? undefined : config.theme?.primaryColor,
                        }}
                        disabled={isPreview}
                    >
                        {isPlaying ? (
                            <Pause className={`${iconSize} text-white`} fill="white" />
                        ) : (
                            <Play className={`${iconSize} text-white ml-0.5`} fill="white" />
                        )}
                    </button>
                </div>
            );

        case 'volume':
            return (
                <div className={`${margins} ${alignment} w-full flex flex-col`}>
                    <div className="flex items-center gap-4 w-full max-w-xs">
                        <VolumeX className="h-5 w-5 text-white/70 flex-shrink-0" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume * 100}
                            onChange={(e) => !isPreview && onVolumeChange?.(parseInt(e.target.value) / 100)}
                            disabled={isPreview}
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                        />
                        <Volume2 className="h-5 w-5 text-white/70 flex-shrink-0" />
                    </div>
                </div>
            );

        case 'socialIcons':
            const socialIconSize = sizeClasses.socialIcons[settings.size || 'md'];
            const socialIcons = config.social?.slice(0, 4) || [];
            return (
                <div className={`${margins} ${alignment} w-full flex flex-col`}>
                    <div className="flex gap-4">
                        {socialIcons.map((s: any, i: number) => (
                            <div
                                key={i}
                                className={`flex ${socialIconSize} items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all`}
                            >
                                {s.platform === 'facebook' && <FaFacebook className="h-5 w-5 text-white" />}
                                {s.platform === 'instagram' && <FaInstagram className="h-5 w-5 text-white" />}
                                {s.platform === 'whatsapp' && <FaWhatsapp className="h-5 w-5 text-white" />}
                                {s.platform === 'twitter' && <FaXTwitter className="h-5 w-5 text-white" />}
                                {s.platform === 'website' && <FaGlobe className="h-5 w-5 text-white" />}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'footer':
            const footerSize = settings.size === 'sm' ? 'text-xs' : settings.size === 'lg' ? 'text-sm' : 'text-xs';
            const footerFontSize = settings.fontSize ? fontSizeClasses[settings.fontSize] : '';
            return (
                <div className={`${margins} ${alignment} w-full flex flex-col space-y-1`}>
                    <p className={`${footerFontSize || footerSize} opacity-60`}>{config.footerText || '© 2025 Radio'}</p>
                    {config.creditsText && (
                        <p className="text-[10px] opacity-40">{config.creditsText}</p>
                    )}
                </div>
            );

        case 'banner':
            // Placeholder for banner - can be enhanced later
            return (
                <div className={`${spacing} ${alignment} w-full flex flex-col`}>
                    <div className="w-full h-20 bg-white/10 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-white/50">Banner Publicitario</span>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
