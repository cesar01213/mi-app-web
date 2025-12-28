import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Tambo Manager Pro',
        short_name: 'TamboPro',
        description: 'Gestión Inteligente y Técnica de Tambos',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            }
        ],
    };
}
