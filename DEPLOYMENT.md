# 🚀 GestCommerce — Guide de déploiement complet

## 📁 Structure du projet

```
ecommerce-pwa/
├── public/
│   ├── icons/
│   │   ├── icon-72.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-144.png
│   │   ├── icon-152.png
│   │   ├── icon-192.png
│   │   ├── icon-384.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── dashboard/page.tsx
│   │   ├── ventes/page.tsx
│   │   ├── produits/page.tsx
│   │   ├── depenses/page.tsx
│   │   ├── parametres/page.tsx
│   │   └── offline/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   └── InstallBanner.tsx
│   │   ├── ui/
│   │   │   ├── Modal.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── PeriodFilter.tsx
│   │   └── sales/
│   │       └── SaleForm.tsx
│   ├── hooks/
│   │   └── useApp.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   └── export.ts
│   └── types/
│       └── index.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## ⚙️ Commandes terminal

### 1. Cloner ou créer le projet

```bash
# Option A : Utiliser les fichiers fournis
# Copiez tous les fichiers dans un nouveau dossier

# Option B : Créer depuis zéro avec Next.js
npx create-next-app@latest ecommerce-pwa \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir
```

### 2. Installer les dépendances

```bash
cd ecommerce-pwa
npm install lucide-react idb date-fns
```

### 3. Tester en local

```bash
npm run dev
# → http://localhost:3000
```

### 4. Build de production

```bash
npm run build
npm start
```

---

## 🐙 Guide GitHub

### Créer le dépôt

```bash
# 1. Sur github.com → New repository
# Nom : ecommerce-pwa
# Public ou Private
# NE PAS initialiser avec README (on va pousser nos fichiers)

# 2. Dans votre terminal
cd ecommerce-pwa
git init
git add .
git commit -m "Initial commit — GestCommerce PWA"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/ecommerce-pwa.git
git push -u origin main
```

### .gitignore (créer ce fichier)

```
node_modules/
.next/
.env*.local
.DS_Store
*.log
out/
```

---

## ▲ Guide Vercel

### Méthode 1 : Via l'interface Vercel (recommandée)

1. Allez sur **vercel.com**
2. Cliquez **"Add New → Project"**
3. Connectez votre compte GitHub
4. Sélectionnez le dépôt **ecommerce-pwa**
5. Configuration automatique détectée (Next.js)
6. Cliquez **"Deploy"**
7. Attendez ~2 minutes
8. ✅ Votre lien public est prêt !

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer depuis le dossier du projet
cd ecommerce-pwa
vercel

# Suivre les instructions :
# ? Set up and deploy? → Yes
# ? Which scope? → Votre compte
# ? Link to existing project? → No
# ? What's your project's name? → ecommerce-pwa
# ? In which directory is your code located? → ./
# → Déploiement automatique

# Pour déployer en production
vercel --prod
```

### Variables d'environnement Vercel

Aucune variable d'environnement requise.
L'application fonctionne entièrement en local (IndexedDB).

---

## 🌐 Obtenir le lien public

Après déploiement Vercel :

1. Dashboard Vercel → votre projet
2. Onglet **"Deployments"**
3. Votre URL : `https://ecommerce-pwa-XXXXX.vercel.app`

### Domaine personnalisé (optionnel)

1. Vercel → votre projet → **"Settings"** → **"Domains"**
2. Ajouter votre domaine : `gestcommerce.com`
3. Configurer les DNS chez votre registrar

---

## 📱 Installation Android

### Méthode automatique (Chrome)

1. Ouvrez Chrome sur Android
2. Allez sur votre URL Vercel
3. Une bannière **"Installer l'application"** apparaît en bas
4. Appuyez sur **"Installer"**
5. L'application s'installe sur l'écran d'accueil

### Méthode manuelle

1. Ouvrez Chrome sur Android
2. Allez sur votre URL Vercel
3. Appuyez sur les **3 points** en haut à droite
4. Sélectionnez **"Ajouter à l'écran d'accueil"**
5. Confirmez le nom **"GestCommerce"**
6. L'icône apparaît sur l'écran d'accueil

---

## 📱 Installation iPhone

1. Ouvrez **Safari** (obligatoire, pas Chrome) sur iPhone
2. Allez sur votre URL Vercel
3. Appuyez sur le bouton **Partager** (rectangle avec flèche en bas)
4. Faites défiler et appuyez sur **"Sur l'écran d'accueil"**
5. Confirmez le nom **"GestCommerce"**
6. Appuyez sur **"Ajouter"**
7. L'icône apparaît sur l'écran d'accueil

> ⚠️ **Important iOS** : Safari est obligatoire pour l'installation PWA sur iPhone. Chrome iOS ne permet pas l'installation.

---

## 🔄 Mises à jour

### Déployer une mise à jour

```bash
# Méthode Git (recommandée)
git add .
git commit -m "Mise à jour : description des changements"
git push origin main
# Vercel redéploie automatiquement

# Méthode CLI directe
vercel --prod
```

---

## 🗄️ Données et confidentialité

- Toutes les données sont stockées **localement** sur l'appareil (IndexedDB)
- **Aucune donnée n'est envoyée** à un serveur
- **Aucun compte** requis
- La sauvegarde JSON permet de transférer les données vers un autre appareil

---

## 🛠️ Personnalisation

### Changer le nom de l'application

1. `src/app/layout.tsx` → modifier `title` dans `metadata`
2. `public/manifest.json` → modifier `name` et `short_name`

### Changer les couleurs

1. `tailwind.config.ts` → modifier la palette `primary`
2. `src/app/globals.css` → modifier les couleurs CSS

### Changer la devise par défaut

1. `src/lib/db.ts` → chercher `"FCFA"` et remplacer

---

## 📞 Support

En cas de problème de déploiement :
- Vercel Status : status.vercel.com
- Next.js Docs : nextjs.org/docs
- Vercel Docs : vercel.com/docs
