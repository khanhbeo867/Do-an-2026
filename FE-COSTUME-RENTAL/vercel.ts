import { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'tanstack-start',
  buildCommand: 'npm run build',
  outputDirectory: '.output',
  rewrites: [
    {
      source: '/storage/images-gallery/:path*',
      destination: 'http://api.diamond.io.vn/storage/images-gallery/:path*',
    },
  ],
}
