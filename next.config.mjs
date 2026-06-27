/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone agar image Docker hanya membawa file yang diperlukan saat runtime.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
