import path from 'path';
/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/transactions/deposit', // Change this to your desired path
                permanent: true, // Set to false if you want a temporary redirect
            },

            {
                source: '/auth/:path*',
                destination: '/transactions/deposit', // Change this to your desired path
                permanent: true, // Set to false if you want a temporary redirect
            },
        ];
    },
};
export default nextConfig;
