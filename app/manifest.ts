import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taxi Seguro - Tu viaje seguro y rápido",
    short_name: "Taxi Seguro",
    description:
      "Aplicación móvil para solicitar servicios de taxi de forma segura y rápida",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFC107",
    orientation: "portrait",
    categories: ["transportation", "travel"],
    icons: [],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
