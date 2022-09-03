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
        formats: ['image/avif', 'image/webp'],
    }
}

module.exports = nextConfig
