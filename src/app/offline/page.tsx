"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
        <span className="text-4xl">📡</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Mode hors ligne</h1>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
        Vous êtes hors connexion. Toutes vos données sont disponibles localement.
      </p>
      <div className="space-y-2 w-full max-w-xs">
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-xs">✓</span>
          </div>
          <span className="text-sm text-slate-300">Ventes accessibles</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-xs">✓</span>
          </div>
          <span className="text-sm text-slate-300">Produits accessibles</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-xs">✓</span>
          </div>
          <span className="text-sm text-slate-300">Dépenses accessibles</span>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 bg-green-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-green-400 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
