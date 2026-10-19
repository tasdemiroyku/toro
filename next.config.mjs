// Public files in our Supabase Storage bucket can be resized by next/image
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: supabaseUrl
      ? [{ protocol: 'https', hostname: new URL(supabaseUrl).hostname, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
};

export default nextConfig;
