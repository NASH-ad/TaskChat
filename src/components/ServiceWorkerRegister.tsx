"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/sw.js")
            .catch((e) => console.error("Échec d'enregistrement du SW:", e));
        }
    }, []);

    return null;
}