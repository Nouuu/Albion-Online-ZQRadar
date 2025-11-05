# 📝 Setup Développeur - ZQRadar

> **Guide de setup** pour nouveaux développeurs après clone du repo

---

## 🚀 Installation Rapide

### 1. Cloner le Repository
```bash
git clone https://github.com/Zeldruck/Albion-Online-ZQRadar.git
cd Albion-Online-ZQRadar
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Télécharger les Dumps Officiels Albion
**Important:** Le dossier `work/data/ao-bin-dumps-master/` est git-ignoré (trop volumineux)

```bash
# Télécharger les dumps officiels
git clone https://github.com/ao-data/ao-bin-dumps.git work/data/ao-bin-dumps-master
```

### 4. Installer Npcap (Windows)
- Télécharger: https://npcap.com/
- Version minimale: 1.84
- **Important:** Installer en mode WinPcap compatible

### 5. Lancer l'Application
```bash
npm start
# Ou pour le dev avec auto-reload:
npm run dev
```

---

## 📂 Structure du Projet

```
Albion-Online-ZQRadar/
├── app.js                  # Point d'entrée
├── scripts/                # Code métier
│   ├── classes/           # Classes (Player, Harvestable, etc.)
│   ├── handlers/          # Gestionnaires d'événements
│   └── Utils/             # Utilitaires
├── server-scripts/         # Scripts serveur
├── views/                  # Templates EJS
├── build/                  # Scripts de build
├── docs/                   # Documentation complète
│   ├── ai/                # Guides pour agents IA
│   ├── dev/               # Guides développeurs
│   ├── technical/         # Doc technique
│   └── work/              # Scripts Python
└── work/                   # Scripts et données de dev
    ├── scripts/           # 3 scripts Python essentiels
    └── data/              # Données de développement
        ├── ao-bin-dumps-master/  ⚠️ À télécharger manuellement
        ├── living-resources.json
        └── all-typeids.json
```

---

## 🐍 Scripts Python (Optionnel)

Si vous voulez utiliser les scripts Python dans `work/scripts/`:

```bash
# Installer Python 3.8+
# Puis les dépendances (si nécessaire)
pip install -r requirements.txt  # Si un fichier requirements.txt existe
```

**Scripts disponibles:**
- `parse-living-logs.py` - Parser les logs de collecte TypeIDs
- `analyze-typeids.py` - Analyser TypeIDs manquants
- `extract-metadata.py` - Extraire métadonnées mobs

---

## 📚 Documentation

**Pour débuter:**
- `README.md` - Documentation principale
- `docs/README.md` - Index de toute la documentation
- `docs/dev/DEV_GUIDE.md` - Guide développeur d��taillé

**Pour les agents IA:**
- `docs/ai/AI_AGENT_GUIDE.md` - Guide complet pour agents IA
- `docs/ai/MCP_TOOLS.md` - Référence des outils MCP

---

## ⚠️ Problèmes Courants

### "Cannot find module 'cap'"
```bash
npm run rebuild:native
```

### "Aucun adaptateur réseau trouvé"
- Vérifier que Npcap est installé
- Lancer en administrateur (Windows)

### "work/data/ao-bin-dumps-master/ est vide"
```bash
git clone https://github.com/ao-data/ao-bin-dumps.git work/data/ao-bin-dumps-master
```

---

## 🔗 Liens Utiles

- **Repository:** https://github.com/Zeldruck/Albion-Online-ZQRadar
- **Discord:** https://discord.gg/XAWjmzeaD3
- **Npcap:** https://npcap.com/
- **ao-bin-dumps:** https://github.com/ao-data/ao-bin-dumps

---

*Guide de setup - Version 1.0 (2025-11-05)*

