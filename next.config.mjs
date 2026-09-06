/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images are served at the size actually required, in modern formats
  // where the browser accepts them. Part 9.1.
  images: { formats: ['image/avif', 'image/webp'] },
};
export default nextConfig;
