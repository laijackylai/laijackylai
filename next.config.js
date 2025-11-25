/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // distDir: "build",
    images: {
        // loader: 'akamai',
        // path: '',
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'laijackylai-storage-4ba35e56184317-dev.s3.ap-southeast-1.amazonaws.com',
                port: '',
                pathname: '**',
            },
        ],
        domains: [
            'localhost',
            'laijackylai-storage-4ba35e56184317-dev.s3.ap-southeast-1.amazonaws.com'
        ],
    },
    // experimental: {
    //     images: {
    //         unoptimized: true,
    //     },
    // }
}

module.exports = nextConfig
