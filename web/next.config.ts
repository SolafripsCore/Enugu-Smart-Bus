import type { NextConfig } from "next";

const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/index.html", destination: "/" },
  { source: "/about.html", destination: "/about" },
  { source: "/blogs", destination: "/blog" },
  { source: "/blogs.html", destination: "/blog" },
  { source: "/services.html", destination: "/services" },
  { source: "/how-it-works.html", destination: "/how-it-works" },
  { source: "/contact.html", destination: "/contact" },
  { source: "/team.html", destination: "/team" },
  { source: "/blue", destination: "/blue-noble" },
  { source: "/download-our-app", destination: "/download" },
  {
    source: "/download-our-app/download-our-app.html",
    destination: "/download",
  },
  { source: "/login/login.html", destination: "/login" },
  { source: "/signup/signup.html", destination: "/signup" },
  { source: "/forget-password", destination: "/forgot-password" },
  {
    source: "/forget-password/forget-password.html",
    destination: "/forgot-password",
  },
];

// Static export (`STATIC_EXPORT=1 npm run build`) is used for preview hosting on
// plain object storage, where the image optimizer and redirects are unavailable.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isStaticExport,
  },
  ...(isStaticExport
    ? { output: "export" as const }
    : {
        async redirects() {
          return legacyRedirects.map((redirect) => ({
            ...redirect,
            permanent: true,
          }));
        },
      }),
};

export default nextConfig;
