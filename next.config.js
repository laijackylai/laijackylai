/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    distDir: "build",
    images: {
        loader: 'akamai',
        path: ''
    }
}

module.exports = nextConfig
