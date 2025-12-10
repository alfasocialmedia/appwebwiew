// Module configuration types
export type ModuleType =
    | 'logo'
    | 'title'
    | 'slogan'
    | 'playButton'
    | 'volume'
    | 'socialIcons'
    | 'banner'
    | 'footer';

export type ModuleSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModuleSpacing = 'tight' | 'normal' | 'relaxed';
export type ModuleAlignment = 'left' | 'center' | 'right';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export interface ModuleSettings {
    size: ModuleSize;
    spacing: ModuleSpacing;
    alignment: ModuleAlignment;
    marginTop?: number; // 0-12 (in rem units)
    marginBottom?: number; // 0-12 (in rem units)
    fontSize?: FontSize; // For text modules
}

export interface ModuleConfig {
    id: string;
    type: ModuleType;
    enabled: boolean;
    order: number;
    settings: ModuleSettings;
}

export interface PlayerLayout {
    modules: ModuleConfig[];
    globalSpacing: number;
}

// Default layout configuration
export const DEFAULT_LAYOUT: PlayerLayout = {
    modules: [
        {
            id: '1',
            type: 'logo',
            enabled: true,
            order: 0,
            settings: { size: 'md', spacing: 'normal', alignment: 'center', marginTop: 0, marginBottom: 2 }
        },
        {
            id: '2',
            type: 'title',
            enabled: true,
            order: 1,
            settings: { size: 'lg', spacing: 'normal', alignment: 'center', fontSize: 'xl', marginTop: 0, marginBottom: 1 }
        },
        {
            id: '3',
            type: 'slogan',
            enabled: true,
            order: 2,
            settings: { size: 'sm', spacing: 'tight', alignment: 'center', fontSize: 'sm', marginTop: 0, marginBottom: 3 }
        },
        {
            id: '4',
            type: 'playButton',
            enabled: true,
            order: 3,
            settings: { size: 'md', spacing: 'normal', alignment: 'center', marginTop: 0, marginBottom: 2 }
        },
        {
            id: '5',
            type: 'volume',
            enabled: true,
            order: 4,
            settings: { size: 'md', spacing: 'tight', alignment: 'center', marginTop: 0, marginBottom: 2 }
        },
        {
            id: '6',
            type: 'socialIcons',
            enabled: true,
            order: 5,
            settings: { size: 'md', spacing: 'normal', alignment: 'center', marginTop: 0, marginBottom: 2 }
        },
        {
            id: '7',
            type: 'footer',
            enabled: true,
            order: 6,
            settings: { size: 'sm', spacing: 'normal', alignment: 'center', fontSize: 'xs', marginTop: 4, marginBottom: 0 }
        }
    ],
    globalSpacing: 4
};

// Module metadata for UI - Using Lucide icons
import { Image, Type, MessageSquare, Play, Volume2, Share2, LayoutGrid, AlignJustify } from 'lucide-react';

export const MODULE_METADATA: Record<ModuleType, {
    label: string;
    Icon: any; // Lucide icon component
    description: string;
    required: boolean;
}> = {
    logo: {
        label: 'Logotipo',
        Icon: Image,
        description: 'Logo de la emisora',
        required: false
    },
    title: {
        label: 'Nombre',
        Icon: Type,
        description: 'Nombre de la radio',
        required: true
    },
    slogan: {
        label: 'Eslogan',
        Icon: MessageSquare,
        description: 'Frase descriptiva',
        required: false
    },
    playButton: {
        label: 'Botón Play',
        Icon: Play,
        description: 'Control de reproducción',
        required: true
    },
    volume: {
        label: 'Volumen',
        Icon: Volume2,
        description: 'Control de volumen',
        required: false
    },
    socialIcons: {
        label: 'Redes Sociales',
        Icon: Share2,
        description: 'Enlaces a redes',
        required: false
    },
    banner: {
        label: 'Banner',
        Icon: LayoutGrid,
        description: 'Espacio publicitario',
        required: false
    },
    footer: {
        label: 'Pie de Página',
        Icon: AlignJustify,
        description: 'Texto inferior',
        required: false
    },
};
