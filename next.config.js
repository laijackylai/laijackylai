/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    distDir: "build",
    images: {
        // loader: 'akamai',
        // path: './assets/images',
        formats: ['image/avif', 'image/webp'],
    },
    // experimental: {
    //     images: {
    //         unoptimized: true,
    //     },
    // }
}

module.exports = nextConfig
