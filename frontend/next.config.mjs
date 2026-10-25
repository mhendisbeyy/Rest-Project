/** @type {import('next').NextConfig} */
const nextConfig = {
  // A production build must not overwrite a running dev server's generated files.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.API_PROXY_TARGET || 'http://localhost:8080'}/api/:path*` }];
  },
};

export default nextConfig;
