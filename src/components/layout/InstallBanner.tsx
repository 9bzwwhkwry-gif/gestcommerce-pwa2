"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check dismissed state
    const wasDismissed = localStorage.getItem("install-banner-dismissed");
    if (wasDismissed) return;

    // iOS detection
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;

    if (isIOSDevice) {
      setIsIOS(true);
      setShowIOSBanner(true);
      return;
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSBanner(false);
    localStorage.setItem("install-banner-dismissed", "true");
  };

  if (dismissed) return null;

  // iOS banner
  if (isIOS && showIOSBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">Installer GestCommerce</p>
          <p className="text-[10px] text-slate-400">
            Appuyez sur <span className="font-medium">Partager</span> puis{" "}
            <span className="font-medium">Ajouter à l&apos;écran</span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // Android/Chrome banner
  if (installPrompt) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">Installer l&apos;application</p>
          <p className="text-[10px] text-slate-400">Accès rapide depuis l&apos;écran d&apos;accueil</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}
