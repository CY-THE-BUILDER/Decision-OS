/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@decision-os/shared"]
};

export default nextConfig;
