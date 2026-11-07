/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: false,
    },
    // distDir: "build",
    images: {
        // loader: 'akamai',
        // path: '',
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2.s3.ap-southeast-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'amplify-d2ukbi00figpw1-ph-laijackylaistoragebucket-rivk3jxqwkow.s3.ap-southeast-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // experimental: {
    //     images: {
    //         unoptimized: true,
    //     },
    // }
}

module.exports = nextConfig
