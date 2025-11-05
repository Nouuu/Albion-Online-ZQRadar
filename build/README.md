# build/

Scripts et outils pour le build et le packaging de ZQRadar.

## Scripts de Build

### `build.bat`
Script batch Windows pour build et release.

```bash
build.bat build    # Build Windows exe
build.bat release  # Build + create release ZIP
```

---

### `Makefile`
Makefile pour environnements Unix (WSL, Linux, macOS).

```bash
make build    # Build ZQRadar.exe
make release  # Build + create release ZIP
make clean    # Nettoyer dist/
```

---

## Scripts Node.js

### `check-system.js`
Vérifie les prérequis système (Node.js, Npcap, etc.).

```bash
npm run check
```

---

### `post-build.js`
Script post-build : copie des assets, création des archives.

```bash
npm run postbuild
# Appelé automatiquement après npm run build
```

---

### `optimize-images.js`
Optimise les images pour réduire la taille du package.

```bash
npm run optimize:images
```

---

### `create-release.js`
Crée une release avec archives ZIP.

---

## 📝 Notes

**Pour builder :**
```bash
npm run build:win     # Windows exe
npm run build:all     # Toutes plateformes
```

**Les fichiers de build ont été déplacés ici pour garder la racine propre.**

