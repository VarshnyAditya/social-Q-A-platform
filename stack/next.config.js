const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    // Production URL of this frontend (e.g. https://codequest-mu-one.vercel.app).
    // Used to build canonical links, Open Graph URLs, robots.txt, and
    // sitemap.xml — must never be localhost.
    SITE_URL: process.env.SITE_URL,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;