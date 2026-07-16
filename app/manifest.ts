import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Monkey Biz Poker Club',
    short_name: 'Monkey Biz',
    description: 'Brag, rib, or splat your poker masterpieces and bad beats.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07162c',
    theme_color: '#ffd13b',
    icons: [
      {
        src: '/img/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/img/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    share_target: {
      action: '/',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url'
      }
    }
  }
}