# 🐛 Debug & Logging System - Guide Complet

> **Date:** 2025-11-06
> **Version:** 2.2 - Refactoring constantes & filtrage centralisé

## 🔄 Migration v2.1 → v2.2

**Changements majeurs :**

- ✅ **Nouveau fichier** : `scripts/constants/LoggerConstants.js` - Constantes centralisées
  - 42 CATEGORIES (MOB, HARVEST, PLAYER, etc.)
  - 90+ EVENTS (NewMobEvent, HarvestStart, etc.)
  - CATEGORY_SETTINGS_MAP (mapping catégorie → setting)

- ✅ **Filtrage centralisé** : LoggerClient.shouldLog() - Lit localStorage en temps réel
  - Suppression de ~40+ conditions `if (settings.debugX && window.logger)`
  - Handlers n'ont plus besoin de vérifier settings
  - Exit early pour performance optimale

- ✅ **Constantes partout** : Remplacement de TOUS les strings hardcodés
  - ❌ AVANT : `window.logger.debug('MOB', 'NewMobEvent', {...})`
  - ✅ APRÈS : `window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...})`

- ✅ **Patterns standardisés** : Import cohérent dans tout le code
  - Classes : `this.CATEGORIES`, `this.EVENTS` (import dans constructor)
  - Scripts locaux : `CATEGORIES`, `EVENTS` (import en haut du module)
  - Fonctions globales : `window.CATEGORIES`, `window.EVENTS`

## 🔄 Migration v2.0 → v2.1

**Changements de catégories debug :**

- ❌ **Supprimé** : `logLivingCreatures` → ✅ **Remplacé par** : `debugEnemies`
- ❌ **Supprimé** : `logLivingResources` → ✅ **Remplacé par** : `debugHarvestables`

**Nouveaux settings ajoutés :**
- ✅ `debugHarvestables` : Debug verbose des ressources récoltables (living + static)
- ✅ `debugFishing` : Debug verbose de la pêche
- ✅ `debugPlayers`, `debugChests`, `debugDungeons` : Complètement intégrés

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Contrôles Utilisateur](#contrôles-utilisateur)
4. [Système Technique](#système-technique)
5. [Guide Développeur](#guide-développeur)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

### Objectif
Fournir un système de debug et logging **centralisé**, **dynamique** et **facile d'utilisation** pour tracer les événements dans le radar Albion Online.

### Principes v2.2
- ✅ **Centralisation complète** : Filtrage dans LoggerClient uniquement
- ✅ **Zéro duplication** : ~40+ conditions supprimées des handlers
- ✅ **Type-safe** : Constantes pour catégories et events (42 CATEGORIES, 90+ EVENTS)
- ✅ **Temps réel** : Changements instantanés sans reload (lit localStorage sans cache)
- ✅ **Persistance** : Settings sauvegardés dans localStorage
- ✅ **KISS** : Handlers simples, pas de logique de filtrage

---

## 🏗️ Architecture v2.2

### Flux de Données v2.2 (Simplifié)

```
┌─────────────────┐
│  Settings.ejs   │ ← Utilisateur change une checkbox
│  (Interface)    │
└────────┬────────┘
         │ onChange event
         ▼
┌─────────────────┐
│  localStorage   │ ← Sauvegarde automatique
│   (Storage)     │
└────────┬────────┘
         │ Lecture en temps réel (pas de cache)
         ▼
┌──────────────────────────┐
│  LoggerClient.shouldLog()│ ← Filtrage centralisé
│  (Décision unique)       │
└────────┬─────────────────┘
         │ true/false
         ▼
┌─────────────────┐
│   Handlers      │ ← Appellent window.logger?.debug() directement
│  (Logique)      │    PAS de vérification settings !
└─────────────────┘
```

### Composants v2.2

#### 1. **LoggerConstants.js** (NOUVEAU v2.2)
- **Fichier:** `scripts/constants/LoggerConstants.js`
- **42 CATEGORIES** : MOB, HARVEST, PLAYER, CHEST, etc.
- **90+ EVENTS** : NewMobEvent, HarvestStart, HealthUpdate, etc.
- **CATEGORY_SETTINGS_MAP** : Mapping catégorie → setting
  - MOB → debugEnemies
  - HARVEST → debugHarvestables
  - null pour catégories toujours loggées

#### 2. **LoggerClient.shouldLog()** (NOUVEAU v2.2)
- **Fichier:** `scripts/LoggerClient.js`
- **Filtrage centralisé** : Un seul endroit pour toute la logique
- **Temps réel** : Lit localStorage.getItem() sans cache
- **Exit early** : Return immédiat si filtré (performance)

#### 3. **Interface Utilisateur** (views/main/settings.ejs)
- **Section "🐛 Debug & Logging"**
- Checkboxes globales pour debug
- Bouton Download Debug Logs
- Liens vers pages spécialisées

#### 4. **Stockage** (localStorage)
- Clés préfixées par `setting`
- Valeurs: `"true"` ou `"false"` (strings)
- Persistant entre sessions
- **Lu en temps réel** par LoggerClient (pas de cache)

#### 5. **État Global** (scripts/Utils/Settings.js)
- Classe `Settings` avec propriétés (optionnel en v2.2)
- Méthode `update()` pour rafraîchir
- **Note:** Les handlers n'ont plus besoin de vérifier settings

#### 6. **Handlers** (scripts/Handlers/*.js)
- **v2.2:** Appellent `window.logger?.debug()` directement
- **Plus de conditions** `if (settings.debugX)`
- Importent constantes dans constructor
- Code simplifié et maintenable

---

## 🎛️ Contrôles Utilisateur

### Settings Page (Centralisé)

#### Global Logging Toggles

| Checkbox              | localStorage Key             | Propriété Settings    | Usage                                   |
|-----------------------|------------------------------|-----------------------|-----------------------------------------|
| 🐛 Debug Enemies      | `settingDebugEnemies`        | `this.debugEnemies`   | Debug verbose des ennemis/mobs          |
| 👥 Debug Players      | `settingDebugPlayers`        | `this.debugPlayers`   | Debug verbose des joueurs               |
| 📦 Debug Chests       | `settingDebugChests`         | `this.debugChests`    | Debug verbose des coffres               |
| 🏰 Debug Dungeons     | `settingDebugDungeons`       | `this.debugDungeons`  | Debug verbose des donjons               |
| 🎣 Debug Fishing      | `settingDebugFishing`        | `this.debugFishing`   | Debug verbose de la pêche               |
| 🌱 Debug Harvestables | `settingDebugHarvestables`   | `this.debugHarvestables` | Debug verbose des ressources récoltables |

#### Visual Overlays (Pages Spécialisées)

| Page | Contrôles | localStorage Keys |
|------|-----------|-------------------|
| **Enemies** | Health Bar, Show ID | `settingEnemiesHealthBar`, `settingEnemiesID` |
| **Resources** | Health Bar, Show ID | `settingLivingResourcesHealthBar`, `settingLivingResourcesID` |

#### Actions

| Bouton | Localisation | Fonction |
|--------|-------------|----------|
| 💾 Download Debug Logs | Settings | Exporte JSON avec session info + tous les settings |
| 📋 Log Enemies | Drawing (Radar) | Log la liste des ennemis actuels dans console |
| 👁️ View Cache | Resources | Affiche le cache TypeID dans console |
| 🗑️ Clear Cache | Resources | Vide le cache TypeID et propose reload |

---

## ⚙️ Système Technique

### 1. Mise à Jour Dynamique

#### Mécanisme (scripts/Utils/Utils.js)

```javascript
// Override localStorage.setItem pour détecter les changements
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    
    if (key.startsWith('setting')) {
        console.log(`🔄 [Settings] Update: ${key} = ${value}`);
        settings.update(); // ← Mise à jour instantanée
    }
};
```

#### Avantages
- ✅ Changements **instantanés** (pas de reload nécessaire)
- ✅ Fonctionne sur **même page** (storage event ne suffit pas)
- ✅ Logs de debug pour tracking

### 2. Utilisation dans les Handlers

#### MobsHandler.js

```javascript
NewMobEvent(parameters) {
    // ...
    
    // 🐛 DEBUG: Log raw parameters
    if (this.settings && this.settings.debugEnemies) {
        console.log(`[DEBUG_ENEMY] RAW PARAMS | ID=${id} TypeID=${typeId}`);
    }
    
    // 🌱 DEBUG: Living creatures enhanced (harvestables)
    if (this.settings && this.settings.debugHarvestables) {
        this.logLivingCreatureEnhanced(id, typeId, health, ...);
    }
}
```

#### HarvestablesHandler.js

```javascript
onHarvestStart(harvestableId) {
    // ...

    if (this.settings && this.settings.debugHarvestables && window.logger) {
        window.logger.debug('HARVEST', 'HarvestStart', {
            harvestableId,
            timestamp: new Date().toISOString()
        });
    }
}
```

### 3. Format des Logs

#### Living Creatures (Enhanced JSON)

```javascript
[LIVING_JSON] {
    "timestamp": "2025-11-05T18:30:45.123Z",
    "typeId": 12345,
    "entity": {
        "name": "Rabbit",
        "tier": 4,
        "enchant": 1,
        "type": "Hide"
    },
    "state": {
        "health": 850,
        "alive": true,
        "rarity": 112
    },
    "validation": {
        "animal": "Rabbit",
        "expectedHP": 850,
        "match": true
    }
}
```

#### Living Resources (CSV)

```
🌱 [HarvestablesHandler] HarvestStart
{
    harvestableId: 67890,
    timestamp: "2025-11-05T18:30:45.123Z"
}
```

#### Debug Enemies (Verbose)

```
[DEBUG_ENEMY] RAW PARAMS | ID=123 TypeID=456 | params[2]=255 (normalized) params[13]=1500 (maxHP) params[19]=112 (rarity)
```

---

## 👨‍💻 Guide Développeur v2.2

### Patterns d'Import des Constantes

#### 1. Classes (Handlers, Drawings)

```javascript
class MobsHandler {
    constructor(settings) {
        // Import constantes dans constructor
        const { CATEGORIES, EVENTS } = window;
        this.CATEGORIES = CATEGORIES;
        this.EVENTS = EVENTS;
        this.settings = settings;
    }
    
    NewMobEvent(params) {
        // ✅ v2.2 - Filtrage automatique, pas de if
        window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {
            id: params[0],
            typeId: params[1]
        });
    }
}
```

#### 2. Scripts avec Scope Local (Utils.js)

```javascript
// Import en haut du module
const { CATEGORIES, EVENTS } = window;

// Utilisation directe
window.logger?.info(CATEGORIES.WEBSOCKET, EVENTS.Connected, {
    page: 'drawing'
});
```

#### 3. Fonctions Globales (ResourcesHelper.js)

```javascript
function clearCache() {
    // Utiliser window.CATEGORIES directement
    window.logger?.info(window.CATEGORIES.CACHE, window.EVENTS.CacheCleared, {});
}
```

### Ajouter une Nouvelle Catégorie/Event

#### 1. Ajouter dans LoggerConstants.js

```javascript
const CATEGORIES = {
    // ... existants
    MY_FEATURE: 'MY_FEATURE'
};

const EVENTS = {
    // ... existants
    MyFeatureStart: 'MyFeatureStart',
    MyFeatureEnd: 'MyFeatureEnd'
};

const CATEGORY_SETTINGS_MAP = {
    // ... existants
    MY_FEATURE: 'debugMyFeature', // ou null si toujours loggé
};
```

#### 2. Ajouter le checkbox dans settings.ejs (si nouveau setting)

```html
<label class="flex items-center space-x-2">
  <input 
    type="checkbox" 
    id="settingDebugMyFeature" 
    class="h-5 w-5 text-indigo-600 border-gray-300 rounded-md"
  >
  <span class="text-gray-600 dark:text-gray-300">🆕 Debug My Feature</span>
</label>
```

#### 3. Ajouter event listener dans settings.ejs

```javascript
const settingDebugMyFeature = document.getElementById("settingDebugMyFeature");

settingDebugMyFeature.addEventListener("change", function (event) {
  saveToLocalStorage("settingDebugMyFeature", event.target.checked);
});

// Initialize
settingDebugMyFeature.checked = getFromLocalStorage("settingDebugMyFeature") === "true";
```

#### 4. Utiliser dans le Code

```javascript
// ✅ CORRECT v2.2 - Filtrage automatique
window.logger?.debug(this.CATEGORIES.MY_FEATURE, this.EVENTS.MyFeatureStart, {
    data: 'some data'
});

// ❌ INCORRECT v2.2 - Ne PAS vérifier settings manuellement
if (this.settings.debugMyFeature && window.logger) {
    window.logger.debug(...); // Duplication inutile !
}
```

### Best Practices v2.2

#### ✅ DO

- **Utiliser constantes partout** : `this.CATEGORIES.MOB`, `this.EVENTS.NewMobEvent`
- **Importer dans constructor** (classes) : `const { CATEGORIES, EVENTS } = window;`
- **Optional chaining** : `window.logger?.debug(...)` au lieu de `if (window.logger)`
- **Pas de vérification settings** : Laisser LoggerClient.shouldLog() filtrer
- **Ajouter CATEGORY_SETTINGS_MAP** : Définir le mapping pour nouvelles catégories
- **Temps réel garanti** : LoggerClient lit localStorage sans cache

#### ❌ DON'T

- **Ne PAS** utiliser strings hardcodés : `'MOB'` → utiliser `CATEGORIES.MOB`
- **Ne PAS** vérifier settings manuellement : `if (settings.debugX)` → obsolète en v2.2
- **Ne PAS** dupliquer le filtrage : LoggerClient.shouldLog() s'en occupe
- **Ne PAS** oublier d'importer constantes : Import obligatoire dans constructor
- **Ne PAS** utiliser `console.log()` : Utiliser `window.logger`

#### Migration v2.1 → v2.2

```javascript
// ❌ ANCIEN v2.1
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'NewMobEvent', {...});
}

// ✅ NOUVEAU v2.2
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});
```

---

## 🔧 Troubleshooting v2.2

### Les changements ne prennent pas effet

**Symptôme:** Checkbox changée mais logs n'apparaissent pas

**Solutions v2.2:**
1. ✅ Vérifier localStorage : `localStorage.getItem("settingDebugEnemies")` = `"true"` ?
2. ✅ Vérifier CATEGORY_SETTINGS_MAP : Le mapping catégorie → setting existe ?
3. ✅ Vérifier LoggerConstants.js : La catégorie/event est définie ?
4. ✅ Vérifier console : LoggerClient.shouldLog() retourne true ?

### Logs n'apparaissent pas dans console

**Symptôme:** Setting activé mais rien dans console

**Solutions v2.2:**
1. ✅ Vérifier niveau console : Warnings/Logs pas filtrés ?
2. ✅ Vérifier radar connecté : Handlers pas initialisés avant connexion
3. ✅ Vérifier événement : L'action loguée se produit vraiment ?
4. ✅ Vérifier F12 : Console ouverte et visible ?
5. ✅ Vérifier constantes : `window.CATEGORIES` et `window.EVENTS` chargés ?

### "Cannot read properties of undefined (reading 'MOB')"

**Symptôme:** Erreur au chargement

**Solutions v2.2:**
1. ✅ Vérifier layout.ejs : LoggerConstants.js chargé avant les autres scripts ?
2. ✅ Vérifier constructor : Import `const { CATEGORIES, EVENTS } = window;` présent ?
3. ✅ Vérifier timing : Handler instancié après chargement des constantes ?

### Strings hardcodés détectés

**Symptôme:** Code utilise encore `'MOB'` au lieu de `CATEGORIES.MOB`

**Solutions v2.2:**
1. ✅ Remplacer tous les strings par constantes
2. ✅ Utiliser recherche globale pour trouver : `window.logger.*(\'[A-Z_]+\'`
3. ✅ Vérifier MCP git diff pour s'assurer que tout est migré

### Download Debug Logs ne fonctionne pas

**Symptôme:** Bouton ne répond pas ou erreur

**Solutions:**
1. ✅ Vérifier event listener : `downloadLogsBtn.addEventListener` présent ?
2. ✅ Vérifier fonction : `downloadDebugLogs()` définie ?
3. ✅ Vérifier console : Erreur JavaScript visible ?
4. ✅ Vérifier popup blocker : Navigateur bloque le download ?

---

## 📊 État des Settings

### Settings Implémentés ✅

| Setting | Interface | localStorage | Settings.js | Handlers |
|---------|-----------|--------------|-------------|----------|
| Log Living Creatures | ✅ | ✅ | ✅ | ✅ MobsHandler |
| Log Living Resources | ✅ | ✅ | ✅ | ✅ HarvestablesHandler |
| Debug Enemies | ✅ | ✅ | ✅ | ✅ MobsHandler |
| Enemies Health Bar | ✅ | ✅ | ✅ | ✅ Drawing |
| Enemies ID | ✅ | ✅ | ✅ | ✅ Drawing |
| Living Resources Health Bar | ✅ | ✅ | ✅ | ✅ Drawing |
| Living Resources ID | ✅ | ✅ | ✅ | ✅ Drawing |

### Ancien Système Supprimé ❌

| Composant | État | Date Suppression |
|-----------|------|------------------|
| DebugConfig.js | ❌ Supprimé | 2025-11-05 |
| window.debugLogs | ❌ Supprimé | 2025-11-05 |
| 15 références window.debugLogs | ❌ Migrées | 2025-11-05 |

---

## 🎯 Prochaines Évolutions

### Court Terme
- [ ] Ajouter settings pour autres types d'entités (chests, dungeons)
- [ ] Filtres de log par tier/enchant
- [ ] Export logs vers fichier texte

### Moyen Terme
- [ ] Interface de visualisation des logs dans l'app
- [ ] Statistiques de logging (nombre d'événements par type)
- [ ] Log replay pour debug

### Long Terme
- [ ] Système de profils de logging
- [ ] API pour plugins externes
- [ ] Cloud sync des settings

---

## 📝 Changelog

### v2.2 - 2025-11-06 (NOUVEAU)
- ✅ **Constantes centralisées** : LoggerConstants.js (42 CATEGORIES, 90+ EVENTS)
- ✅ **Filtrage centralisé** : LoggerClient.shouldLog() - Lit localStorage en temps réel
- ✅ **Suppression duplication** : ~40+ conditions `if (settings.debugX)` supprimées
- ✅ **Type-safe** : Remplacement de TOUS les strings par constantes
- ✅ **Patterns standardisés** : Import cohérent (classes, scripts, fonctions globales)
- ✅ **CATEGORY_SETTINGS_MAP** : Mapping automatique catégorie → setting
- ✅ **Performance** : Exit early dans shouldLog()
- ✅ **KISS compliant** : Handlers ultra-simples, zéro logique de filtrage
- ✅ **15 fichiers refactorés** : MobsHandler, HarvestablesHandler, Utils.js, etc.
- ✅ **Documentation complète** : LOGGING.md et DEBUG_LOGGING_GUIDE.md v2.2
- ✅ **Mémoire MCP** : logging_system_v2.2_constants_refactoring

### v2.1 - 2025-11-06
- ✅ Refactoring complet catégories debug
- ✅ Suppression `logLivingCreatures` → `debugEnemies`
- ✅ Suppression `logLivingResources` → `debugHarvestables`
- ✅ Ajout complet : `debugHarvestables`, `debugFishing`
- ✅ Correction cohérence logs (catégories, niveaux, filtrage)
- ✅ Suppression alpine.min.js local (-27 KB) - CDN utilisé
- ✅ Documentation v2.1 complète

### v2.0 - 2025-11-05
- ✅ Centralisation complète dans Settings.ejs
- ✅ Mise à jour dynamique sans reload
- ✅ Suppression ancien système window.debugLogs
- ✅ Migration HarvestablesHandler
- ✅ Documentation complète

### v1.0 - 2025-11-04
- Système initial avec checkboxes distribuées
- window.debugLogs pour logs techniques
- Pas de mise à jour dynamique

---

## 📚 Références

- **Code Source:**
  - `views/main/settings.ejs` - Interface utilisateur
  - `scripts/Utils/Settings.js` - État et logique
  - `scripts/Utils/Utils.js` - Initialisation et listeners
  - `scripts/Handlers/MobsHandler.js` - Utilisation logging
  - `scripts/Handlers/HarvestablesHandler.js` - Utilisation logging

- **Documentation:**
  - `work/DEBUG_LOGGING_GUIDE.md` - Ce fichier
  - `docs/technical/LOGGING.md` - Documentation technique complète
  - Memory Serena: `debug-logging-centralization.md`

---

**Maintenu par:** Équipe ZQRadar
**Dernière mise à jour:** 2025-11-06

