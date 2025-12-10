import { ModuleType } from './layout';

export const MODULE_METADATA: Record<ModuleType, {
    label: string;
    description: string;
    icon: string;
    required?: boolean;
}> = {
    logo: {
        label: 'Logotipo',
        description: 'Logo de la emisora',
        icon: '⬜',
        required: true,
    },
    title: {
        label: 'Nombre',
        description: 'Nombre de la radio',
        icon: 'T',
        required: true,
    },
    slogan: {
        label: 'Eslogan',
        description: 'Frase descriptiva',
        icon: 't',
    },
    playButton: {
        label: 'Botón Play',
        description: 'Control de reproducción',
        icon: '▶',
        required: true,
    },
    volume: {
        label: 'Volumen',
        description: 'Control de volumen',
        icon: '🔊',
    },
    socialIcons: {
        label: 'Redes Sociales',
        description: 'Enlaces a redes',
        icon: '🌐',
    },
    banner: {
        label: 'Banner',
        description: 'Espacio publicitario',
        icon: '▭',
    },
    footer: {
        label: 'Pie de Página',
        description: 'Texto inferior',
        icon: '═',
    },
};
