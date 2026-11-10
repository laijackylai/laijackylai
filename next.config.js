/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    // Static Vite builds in public/projects/<id>. Point at index.html: Next serves no directory
    // index, and the Iceland page must sit inside its service worker's /projects/iceland/ scope.
    async redirects() {
        return ['iceland', 'flight'].map(id => ({ source: `/projects/${id}`, destination: `/projects/${id}/index.html`, permanent: false }))
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
    // distDir: "build",
    images: {
        // loader: 'akamai',
        // path: '',
        formats: ['image/avif', 'image/webp'],
        qualities: [40, 65, 75],
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
