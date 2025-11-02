# 🛠️ OUTILS DE DIAGNOSTIC

**Dernière mise à jour**: 2025-11-02

---

## 📋 Scripts disponibles

### 🔍 Analyse des logs

#### `analyze_logs_typeids.js`
**Usage**: `node analyze_logs_typeids.js`

**Fonction**: Analyse les logs de session pour extraire les TypeID découverts
- Parse les logs JSON/NDJSON
- Extrait les TypeID par type (Hide, Fiber, etc.)
- Détecte les anomalies et transformations suspectes
- Génère un rapport de découvertes

**Sortie**: Console avec statistiques TypeID

---

#### `find_suspect_typeids.js`
**Usage**: `node find_suspect_typeids.js`

**Fonction**: Détecte les TypeID suspects dans les logs
- Identifie les transformations Fiber ↔ Wood/Hide
- Flag les TypeID qui changent de type
- Repère les race conditions

**Sortie**: Liste des TypeID suspects avec raisons

---

### 🧹 Nettoyage

#### `clean_repo.bat`
**Usage**: Double-clic ou `cmd /c clean_repo.bat`

**Fonction**: Nettoie le repository
- Supprime fichiers JSON de configuration Albion inutilisés
- Supprime fichiers temporaires (LOGS.json, etc.)
- Conserve uniquement les fichiers essentiels

**Note**: Script batch Windows, utiliser cmd.exe (pas PowerShell)

---

## 📊 Documentation

### `TYPEIDS_STATUS.md`
État actuel des TypeID connus et suspects
- Liste TypeID validés
- TypeID en attente de validation
- Problèmes connus

---

## 🎯 Workflow recommandé

### 1. Session de jeu
```bash
# Lancer le radar
_RUN.bat

# Jouer et collecter données
# Les logs s'enregistrent automatiquement
```

### 2. Analyse post-session
```bash
# Analyser les TypeID découverts
cd tools
node analyze_logs_typeids.js

# Chercher anomalies
node find_suspect_typeids.js
```

### 3. Mise à jour base de données
```javascript
// Ajouter TypeID validés dans scripts/Handlers/MobsInfo.js
this.addItem(TypeID, Tier, Type, "ResourceName", Enchant);
```

### 4. Nettoyage périodique
```bash
# Supprimer fichiers temporaires
cd tools
cmd /c clean_repo.bat
```

---

## 📝 Notes

- **Logs format**: NDJSON uniquement (un JSON par ligne)
- **TypeID validation**: Toujours confirmer en session terrain
- **Cache localStorage**: Utilisé comme backup, pas source primaire
- **PowerShell**: Ne pas utiliser pour scripts .bat, utiliser cmd.exe

---

**Voir aussi**:
- [../DEV_NOTES.md](../DEV_NOTES.md) - Documentation technique complète
- [../TODO.md](../TODO.md) - Tâches en cours
- [TYPEIDS_STATUS.md](TYPEIDS_STATUS.md) - État TypeID

