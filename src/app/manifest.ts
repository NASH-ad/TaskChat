import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "TaskChat",
        short_name: "TaskChat",
        description: "Gère tes tâches en parlant à un assistant.",
        start_url: "/",
        display: "standalone",          // plein écran, sans barre d'adresse
        background_color: "#ffffff",
        theme_color: "#2563eb",         // adapte à ta couleur
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            {
                src: "/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}