import type {NextConfig} from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
};
export default config;
