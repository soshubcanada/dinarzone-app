import type { MetadataRoute } from "next";

const BASE_URL = "https://dinarzone-app.vercel.app";
const LOCALES = ["fr", "en", "ar"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/dashboard",
    "/send",
    "/history",
    "/agents",
    "/kyc",
    "/login",
    "/register",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "/agents" ? "weekly" : "daily",
        priority: route === "/dashboard" ? 1 : route === "/send" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
