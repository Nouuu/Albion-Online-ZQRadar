# 📊 Système de Logging & Debug - ZQRadar v2.2

> **Version:** 2.2 (Refactoring constantes & filtrage centralisé)
> **Dernière mise à jour:** 2025-11-06
> **Statut:** ✅ Implémenté et fonctionnel
> **Mainteneur:** Nospy

## 🔄 Migration v2.1 → v2.2

**Changements majeurs :**

- ✅ **Nouveau** : `LoggerConstants.js` - Constantes centralisées (42 CATEGORIES, 90+ EVENTS)
- ✅ **Nouveau** : Filtrage centralisé dans `LoggerClient.shouldLog()` - Lit localStorage en temps réel
- ✅ **Supprimé** : ~40+ conditions `if (settings.debugX && window.logger)` dans les handlers
- ✅ **Remplacé** : TOUS les strings de catégories/events par constantes (`CATEGORIES.MOB`, `EVENTS.NewMobEvent`)
- ✅ **Standardisé** : Patterns d'import cohérents (classes: `this.CATEGORIES`, fonctions: `window.CATEGORIES`)

**Avant v2.2 (OLD) :**
```javascript
// ❌ Duplication des conditions partout
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'NewMobEvent', {...}); // ❌ Strings hardcodés
}
```

**Après v2.2 (NEW) :**
```javascript
// ✅ Filtrage centralisé dans LoggerClient + constantes
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});
```

## 🔄 Migration v2.0 → v2.1

**Changements de catégories debug :**

- ❌ **Supprimé** : `logLivingCreatures` → ✅ **Remplacé par** : `debugEnemies`
- ❌ **Supprimé** : `logLivingResources` → ✅ **Remplacé par** : `debugHarvestables`
- ❌ **Supprimé** : Catégorie log `LIVING_CREATURE` → ✅ **Remplacé par** : `HARVEST`

**Nouveaux settings ajoutés :**
- ✅ `debugHarvestables` : Debug verbose des ressources récoltables (living + static)
- ✅ `debugFishing` : Debug verbose de la pêche (complètement intégré)

---

## 🎯 Vue d'ensemble

Le système de logging v2.0 de ZQRadar est un système **centralisé**, **offline-capable** et **hautement configurable**
qui permet de tracer tous les événements du jeu en temps réel.

### ✨ Nouveautés v2.0

- 🔌 **Mode Offline** : Fonctionne sans serveur WebSocket
- 🎨 **Logs Colorés** : Affichage console avec émojis et couleurs
- 🎛️ **Contrôle Granulaire** : 4 checkboxes de configuration
- 📦 **RAW Packet Debug** : Trace tous les paquets réseau (optionnel)
- 💾 **Export JSONL** : Sauvegarde logs dans des fichiers (optionnel)

### Principes Clés

- ✅ **Centralisation** : Tous les contrôles dans Settings
- ✅ **Filtrage Intelligent** : RAW packets séparés des logs normaux
- ✅ **Performance** : Pas d'overhead si désactivé
- ✅ **Persistance** : Settings sauvegardés dans localStorage

---

## 🏗️ Architecture v2.2

### Composants Principaux

#### 1. **LoggerConstants.js** - Constantes Centralisées (NOUVEAU v2.2)

- Fichier: `scripts/constants/LoggerConstants.js`
- Expose: `window.CATEGORIES`, `window.EVENTS`, `window.CATEGORY_SETTINGS_MAP`
- **42 CATEGORIES** : MOB, HARVEST, PLAYER, CHEST, DUNGEON, FISHING, etc.
- **90+ EVENTS** : NewMobEvent, HarvestStart, HealthUpdate, etc.
- **Mapping catégorie → setting** : MOB → debugEnemies, HARVEST → debugHarvestables

#### 2. **LoggerClient.js** - Cœur du système + Filtrage Centralisé (v2.2)

- Fichier: `scripts/LoggerClient.js`
- Exposé globalement: `window.logger`
- Fonctionne offline (sans WebSocket)
- Affichage console avec couleurs et émojis
- Buffer pour envoi serveur (optionnel)
- **NOUVEAU :** Méthode `shouldLog()` - Filtrage centralisé temps réel

#### 3. **Settings.js** - Configuration

- Fichier: `scripts/Utils/Settings.js`
- Propriétés: `logToConsole`, `logToServer`, `debugRawPacketsConsole`, `debugRawPacketsServer`
- Méthode `returnLocalBool(key, defaultValue)` - Support valeurs par défaut

#### 4. **Settings.ejs** - Interface

- Fichier: `views/main/settings.ejs`
- Section "Console & Server Output"
- 4 checkboxes de contrôle granulaire

---

## 🎛️ Settings Disponibles v2.0

### Console & Server Output (Settings.ejs)

| Setting                    | localStorage Key                | Default | Description                                      |
|----------------------------|---------------------------------|---------|--------------------------------------------------|
| 📺 Display logs in console | `settingLogToConsole`           | ✅ ON    | Affiche logs en console (F12) avec couleurs      |
| 📤 Send logs to server     | `settingLogToServer`            | ❌ OFF   | Envoie logs au serveur → `logs/sessions/*.jsonl` |
| 📦 RAW packets in console  | `settingDebugRawPacketsConsole` | ❌ OFF   | Affiche TOUS les paquets en console ⚠️ VERBEUX   |
| 📦 RAW packets to server   | `settingDebugRawPacketsServer`  | ❌ OFF   | Envoie TOUS les paquets au serveur ⚠️ VERBEUX    |

### Debug Settings (Settings.ejs)

| Setting              | localStorage Key             | Propriété Settings    | Usage                                      |
|----------------------|------------------------------|-----------------------|--------------------------------------------|
| 🐛 Debug Enemies     | `settingDebugEnemies`        | `debugEnemies`        | Debug verbose des ennemis/mobs             |
| 👥 Debug Players     | `settingDebugPlayers`        | `debugPlayers`        | Debug verbose des joueurs                  |
| 📦 Debug Chests      | `settingDebugChests`         | `debugChests`         | Debug verbose des coffres                  |
| 🏰 Debug Dungeons    | `settingDebugDungeons`       | `debugDungeons`       | Debug verbose des donjons                  |
| 🎣 Debug Fishing     | `settingDebugFishing`        | `debugFishing`        | Debug verbose de la pêche                  |
| 🌱 Debug Harvestables| `settingDebugHarvestables`   | `debugHarvestables`   | Debug verbose des ressources récoltables   |

### Visual Debug Settings (Pages spécialisées)

| Page      | Setting    | localStorage Key                  | Propriété                  |
|-----------|------------|-----------------------------------|----------------------------|
| Enemies   | Health Bar | `settingEnemiesHealthBar`         | `enemiesHealthBar`         |
| Enemies   | Show ID    | `settingEnemiesID`                | `enemiesID`                |
| Resources | Health Bar | `settingLivingResourcesHealthBar` | `livingResourcesHealthBar` |
| Resources | Show ID    | `settingLivingResourcesID`        | `livingResourcesID`        |

---

## 📊 API du Logger v2.2

### Constantes Disponibles (NOUVEAU v2.2)

```javascript
// Chargées depuis LoggerConstants.js, disponibles globalement

// CATEGORIES - 42 catégories
window.CATEGORIES.MOB
window.CATEGORIES.MOB_HEALTH
window.CATEGORIES.HARVEST
window.CATEGORIES.PLAYER
window.CATEGORIES.CHEST
window.CATEGORIES.DUNGEON
window.CATEGORIES.FISHING
window.CATEGORIES.PACKET_RAW
// ... etc.

// EVENTS - 90+ événements
window.EVENTS.NewMobEvent
window.EVENTS.HarvestStart
window.EVENTS.HealthUpdate
window.EVENTS.Connected
// ... etc.

// CATEGORY_SETTINGS_MAP - Mapping filtrage
window.CATEGORY_SETTINGS_MAP.MOB // → 'debugEnemies'
window.CATEGORY_SETTINGS_MAP.HARVEST // → 'debugHarvestables'
// null pour catégories toujours loggées (WEBSOCKET, CACHE, etc.)
```

### Méthodes Disponibles

```javascript
// window.logger est disponible globalement sur toutes les pages

// DEBUG - Informations détaillées pour le debug (FILTRÉ par settings)
window.logger?.debug(category, event, data, context);

// INFO - Informations générales (TOUJOURS loggé)
window.logger?.info(category, event, data, context);

// WARN - Avertissements (TOUJOURS loggé)
window.logger?.warn(category, event, data, context);

// ERROR - Erreurs (TOUJOURS loggé)
window.logger?.error(category, event, data, context);

// CRITICAL - Erreurs critiques (TOUJOURS loggé)
window.logger?.critical(category, event, data, context);
```

### Paramètres

- **category** (const) : Catégorie du log depuis `CATEGORIES` (ex: `CATEGORIES.MOB`)
- **event** (const) : Nom de l'événement depuis `EVENTS` (ex: `EVENTS.NewMobEvent`)
- **data** (object) : Données à logger
- **context** (object, optionnel) : Contexte additionnel

### Catégories et Filtrage (v2.2)

| Catégorie         | Événements                                   | Fichiers                       | Filtré par                    | Mapping                    |
|-------------------|----------------------------------------------|--------------------------------|-------------------------------|----------------------------|
| `MOB`             | NewMobEvent, UsingMobInfo                    | MobsHandler.js                 | `settingDebugEnemies`         | `debugEnemies`             |
| `MOB_HEALTH`      | HealthUpdate, RegenerationHealthChanged      | Utils.js, MobsHandler.js       | `settingDebugEnemies`         | `debugEnemies`             |
| `HARVEST`         | HarvestStart, HarvestCancel, ItemIdDiscovery | HarvestablesHandler.js         | `settingDebugHarvestables`    | `debugHarvestables`        |
| `PLAYER`          | NewPlayerEvent, PlayerHealthUpdate           | PlayersHandler.js              | `settingDebugPlayers`         | `debugPlayers`             |
| `CHEST`           | NewChestEvent                                | ChestsHandler.js               | `settingDebugChests`          | `debugChests`              |
| `DUNGEON`         | NewDungeonEvent                              | DungeonsHandler.js             | `settingDebugDungeons`        | `debugDungeons`            |
| `FISHING`         | FishingEnd                                   | FishingHandler.js              | `settingDebugFishing`         | `debugFishing`             |
| `PACKET_RAW`      | Event_* (tous les événements)                | Utils.js                       | `settingDebugRawPackets*`     | `debugRawPackets`          |
| `WEBSOCKET`       | Connected                                    | Divers                         | **Toujours loggé** (null)     | -                          |
| `CACHE`           | CacheCleared, LoadCache                      | ResourcesHelper.js             | **Toujours loggé** (null)     | -                          |

### Exemples d'Utilisation v2.2

```javascript
// ✅ NOUVEAU v2.2 - Classes (MobsHandler.js)
class MobsHandler {
    constructor(settings) {
        const { CATEGORIES, EVENTS } = window;
        this.CATEGORIES = CATEGORIES;
        this.EVENTS = EVENTS;
    }
    
    NewMobEvent(params) {
        // ✅ Plus besoin de if (settings.debugEnemies) !
        // Filtrage automatique dans LoggerClient.shouldLog()
        window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {
            id: params[0],
            typeId: params[1]
        });
    }
}

// ✅ NOUVEAU v2.2 - Scripts locaux (Utils.js)
const { CATEGORIES, EVENTS } = window;

window.logger?.info(CATEGORIES.WEBSOCKET, EVENTS.Connected, {
    page: 'drawing'
});

// ✅ NOUVEAU v2.2 - Fonctions globales (ResourcesHelper.js)
function clearCache() {
    window.logger?.info(window.CATEGORIES.CACHE, window.EVENTS.CacheCleared, {});
}
```

### Filtrage Centralisé v2.2

```javascript
// Dans LoggerClient.js - shouldLog() lit localStorage en temps réel
shouldLog(category, level) {
    // INFO/WARN/ERROR/CRITICAL → toujours loggés
    if (level !== 'DEBUG') return true;
    
    // Récupère le mapping catégorie → setting
    const settingKey = window.CATEGORY_SETTINGS_MAP?.[category];
    if (!settingKey) return true; // Pas de mapping = toujours loggé
    
    // Lit le setting depuis localStorage (TEMPS RÉEL, pas de cache)
    const localStorageKey = 'setting' + settingKey.charAt(0).toUpperCase() + settingKey.slice(1);
    return localStorage.getItem(localStorageKey) === 'true';
}
```

**Avantages :**
- ✅ Changements de checkboxes **instantanés** (lit localStorage sans cache)
- ✅ Handlers **simples** (pas de condition `if (settings.debug)`)
- ✅ **Un seul endroit** pour toute la logique de filtrage

---

## 🎯 Niveaux de Log

Le logger supporte 4 niveaux avec des **règles de filtrage strictes** :

### Définition des Niveaux

- **`debug`** : Logs verbeux, détails techniques (ex: tous les paramètres d'un événement)
    - **FILTRÉ** par les settings de debug (`debugEnemies`, `debugFishing`, etc.)
    - Peut être désactivé pour améliorer les performances

- **`info`** : Actions importantes, découvertes, chargements (ex: chargement de metadata, découverte d'itemId)
    - **TOUJOURS LOGGÉ** - Pas de filtrage par settings
    - Critique pour comprendre le flux de l'application

- **`warn`** : Situations anormales mais non-critiques (ex: ressource non détectée, cache manquant)
    - **TOUJOURS LOGGÉ** - Pas de filtrage par settings
    - Indique des problèmes potentiels nécessitant attention

- **`error`** : Erreurs critiques, exceptions (ex: échec de chargement, erreur de parsing)
    - **TOUJOURS LOGGÉ** - Pas de filtrage par settings
    - Nécessite une action immédiate

### ⚠️ Règle de Filtrage v2.2 (Centralisé)

```javascript
// ✅ CORRECT v2.2 - INFO/WARN/ERROR toujours loggés, pas de condition
window.logger?.info(CATEGORIES.MOB, EVENTS.LoadMetadata, {data});
window.logger?.warn(CATEGORIES.HARVEST, EVENTS.NoCacheWarning, {details});
window.logger?.error(CATEGORIES.MOB, EVENTS.LoadMetadataFailed, error);

// ✅ CORRECT v2.2 - DEBUG filtré automatiquement dans LoggerClient
// Plus besoin de if (settings.debugEnemies) !
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {allParams});

// ❌ INCORRECT v2.2 - Ne PAS vérifier settings manuellement
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'DetailedParams', {allParams}); // Duplication inutile
}

// ❌ INCORRECT v2.2 - Ne PAS utiliser strings hardcodés
window.logger?.debug('MOB', 'NewMobEvent', {data}); // Utiliser CATEGORIES.MOB et EVENTS.NewMobEvent
```

**Migration v2.1 → v2.2 :**

```javascript
// ❌ AVANT v2.1 - Condition manuelle partout
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'NewMobEvent', {...});
}

// ✅ APRÈS v2.2 - Filtrage automatique + constantes
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});
```

---

## 🎨 Format des Logs v2.0

### Affichage Console (Coloré)

```
🔍 [DEBUG] MOB.NewMobEvent_RAW @ 18:30:45
{id: 12345, typeId: 456, health: 850, position: {x: 100, y: 200}}
(page: /drawing)

ℹ️ [INFO] HARVEST.HarvestStart @ 18:31:12
{harvestableId: 67890, tier: 5, enchantment: 2}
(page: /drawing)

⚠️ [WARN] MOB_HEALTH.HealthUpdate @ 18:32:00
{id: 12345, health: 500, maxHealth: 850}
(page: /drawing)

❌ [ERROR] HARVEST.ItemIdDiscovery @ 18:33:45
{error: "Unknown TypeID", typeId: 99999}
(page: /resources)

🚨 [CRITICAL] MOB.CriticalError @ 18:35:00
{message: "Parser failed", stack: "..."}
(page: /drawing)
```

### Fichiers JSONL (Serveur)

**Emplacement:** `logs/sessions/session_<timestamp>_<id>.jsonl`

**Format:**

```jsonl
{"timestamp":"2025-11-05T18:30:45.123Z","level":"DEBUG","category":"MOB","event":"NewMobEvent_RAW","data":{"id":12345,"typeId":456,"health":850},"context":{"sessionId":"session_1730829045123_abc","page":"/drawing"}}
{"timestamp":"2025-11-05T18:31:12.456Z","level":"INFO","category":"HARVEST","event":"HarvestStart","data":{"harvestableId":67890,"tier":5,"enchantment":2},"context":{"sessionId":"session_1730829045123_abc","page":"/drawing","mapId":"ForestA"}}
```

---

## 💻 Utilisation

### Pour l'Utilisateur

1. **Ouvrir Settings** → Onglet Settings dans le menu
2. **Section "Console & Server Output"** → Descendre jusqu'à la section Debug & Logging
3. **Activer les logs souhaités** :
    - ✅ **Display logs in console** → Pour voir les logs en temps réel (recommandé)
    - ✅ **Send logs to server** → Pour sauvegarder dans des fichiers JSONL
    - ⚠️ **RAW packets in console** → Seulement pour debug profond (TRÈS VERBEUX !)
    - ⚠️ **RAW packets to server** → Seulement pour debug profond (TRÈS VERBEUX !)
4. **Ouvrir console (F12)** → Voir les logs colorés en temps réel
5. **Export JSON** → Bouton "Download Debug Logs" pour snapshot complet

### Pour le Développeur v2.2

#### Patterns d'Import des Constantes

**1. Classes (Handlers, Drawings) :**
```javascript
class MobsHandler {
    constructor(settings) {
        // Import une seule fois dans le constructor
        const { CATEGORIES, EVENTS } = window;
        this.CATEGORIES = CATEGORIES;
        this.EVENTS = EVENTS;
        this.settings = settings;
    }
    
    someMethod() {
        // Utiliser avec this.
        window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});
    }
}
```

**2. Scripts avec Scope Local (Utils.js, ItemsPage.js) :**
```javascript
// Import en haut du module
const { CATEGORIES, EVENTS } = window;

// Utiliser directement (sans this.)
window.logger?.info(CATEGORIES.WEBSOCKET, EVENTS.Connected, {...});
```

**3. Fonctions Globales (ResourcesHelper.js) :**
```javascript
function clearCache() {
    // Utiliser window.CATEGORIES directement
    window.logger?.info(window.CATEGORIES.CACHE, window.EVENTS.CacheCleared, {});
}
```

#### Ajouter des Logs dans le Code v2.2

```javascript
// ✅ NOUVEAU v2.2 - Utiliser constantes + optional chaining
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {
    data1: value1,
    data2: value2
}, {
    // Contexte optionnel
    additionalInfo: 'some context'
});

// ✅ Filtrage automatique - Plus besoin de if (settings.debugX)
window.logger?.info(CATEGORIES.HARVEST, EVENTS.HarvestStart, {...});

// ❌ ANCIEN v2.1 - Ne plus utiliser
if (settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'EventName', {...}); // Obsolète
}
```

#### Ajouter une Nouvelle Catégorie ou Event

**1. Ajouter dans LoggerConstants.js :**
```javascript
// Ajouter la catégorie
const CATEGORIES = {
    // ... existants
    MY_NEW_CATEGORY: 'MY_NEW_CATEGORY'
};

// Ajouter l'événement
const EVENTS = {
    // ... existants
    MyNewEvent: 'MyNewEvent'
};

// Ajouter le mapping si filtrage souhaité
const CATEGORY_SETTINGS_MAP = {
    // ... existants
    MY_NEW_CATEGORY: 'debugMyFeature', // ou null si toujours loggé
};
```

**2. Utiliser dans le code :**
```javascript
window.logger?.debug(this.CATEGORIES.MY_NEW_CATEGORY, this.EVENTS.MyNewEvent, {...});
```

#### Filtrage Automatique (v2.2)

```javascript
// ✅ Plus besoin de vérifier settings manuellement !
// Le filtrage est fait automatiquement dans LoggerClient.shouldLog()

// DEBUG → Filtré selon CATEGORY_SETTINGS_MAP
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});

// INFO/WARN/ERROR → Toujours loggés (pas de filtrage)
window.logger?.info(CATEGORIES.CACHE, EVENTS.CacheCleared, {...});
```

---

## 📊 Bonnes Pratiques v2.2

### 1. Utiliser les Constantes Partout

```javascript
// ✅ CORRECT v2.2
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {...});

// ❌ INCORRECT - Strings hardcodés
window.logger?.debug('MOB', 'NewMobEvent', {...});
```

### 2. Choisir le Bon Niveau

**DEBUG** - Détails techniques et verbeux (filtré automatiquement)

```javascript
// ✅ v2.2 - Filtrage automatique, pas de if
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent_ALL_PARAMS, {
    mobId, typeId, allParameters
});
```

**INFO** - Actions importantes (TOUJOURS loggé)

```javascript
// ✅ v2.2 - Pas de condition nécessaire
window.logger?.info(this.CATEGORIES.MOB, this.EVENTS.LoadMetadata, {
    count: this.metadata.length
});
```

**WARN** - Situations anormales (TOUJOURS loggé)

```javascript
// ✅ v2.2
window.logger?.warn(this.CATEGORIES.HARVEST, this.EVENTS.NoCacheWarning, {
    note: 'Resource tracking may be incomplete'
});
```

**ERROR** - Erreurs critiques (TOUJOURS loggé)

```javascript
// ✅ v2.2
window.logger?.error(this.CATEGORIES.MOB, this.EVENTS.LoadMetadataFailed, error);
```

### 3. Respecter les Patterns d'Import

**Classes :**
```javascript
// Import dans constructor, utiliser avec this.
constructor(settings) {
    const { CATEGORIES, EVENTS } = window;
    this.CATEGORIES = CATEGORIES;
    this.EVENTS = EVENTS;
}
```

**Scripts locaux :**
```javascript
// Import en haut du module
const { CATEGORIES, EVENTS } = window;
```

**Fonctions globales :**
```javascript
// Utiliser window.CATEGORIES directement
window.CATEGORIES.CACHE
```

### 4. Ne PAS Vérifier Settings Manuellement

```javascript
// ✅ CORRECT v2.2 - Filtrage automatique
window.logger?.debug(this.CATEGORIES.MOB, this.EVENTS.NewMobEvent, {data});

// ❌ INCORRECT v2.2 - Duplication inutile
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug(...); // Le filtrage est déjà dans LoggerClient !
}
```

### 5. Mapping Catégories → Settings

Le système gère automatiquement le mapping :

- MOB, MOB_HEALTH, MOB_DRAW → `debugEnemies`
- HARVEST, HARVEST_HIDE_T4 → `debugHarvestables`
- PLAYER, PLAYER_HEALTH → `debugPlayers`
- CHEST → `debugChests`
- DUNGEON → `debugDungeons`
- FISHING → `debugFishing`
- PACKET_RAW → `debugRawPackets`
- WEBSOCKET, CACHE, ITEM, etc. → **Toujours loggés** (null)

### 6. Temps Réel Garanti

```javascript
// ✅ Les changements de checkboxes sont instantanés
// LoggerClient.shouldLog() lit localStorage.getItem() sans cache
// → Pas besoin de reload de page !
```

---

## 🔧 Fonctionnement Interne

### Filtrage Centralisé v2.2 (NOUVEAU)

**LoggerClient.shouldLog() - Décision centralisée en temps réel :**

```javascript
shouldLog(category, level) {
    // 1. INFO/WARN/ERROR/CRITICAL → toujours loggés
    if (level !== 'DEBUG') return true;
    
    // 2. Récupère le mapping catégorie → setting
    const settingKey = window.CATEGORY_SETTINGS_MAP?.[category];
    
    // 3. Pas de mapping = toujours loggé (WEBSOCKET, CACHE, etc.)
    if (!settingKey) return true;
    
    // 4. Gestion spéciale RAW packets (console OU serveur)
    if (settingKey === 'debugRawPackets') {
        const consoleEnabled = localStorage.getItem('settingDebugRawPacketsConsole') === 'true';
        const serverEnabled = localStorage.getItem('settingDebugRawPacketsServer') === 'true';
        return consoleEnabled || serverEnabled;
    }
    
    // 5. Lit le setting depuis localStorage (TEMPS RÉEL, pas de cache)
    const localStorageKey = 'setting' + settingKey.charAt(0).toUpperCase() + settingKey.slice(1);
    return localStorage.getItem(localStorageKey) === 'true';
}
```

**Appel dans log() :**
```javascript
log(level, category, event, data, context = {}) {
    // ⚡ Exit early si filtré - Performance optimale
    if (!this.shouldLog(category, level)) return;
    
    // ... reste de la logique de logging
}
```

**Avantages :**
- ✅ **Temps réel** : Lit localStorage à chaque appel (pas de cache)
- ✅ **Exit early** : Return immédiat si log filtré (performance)
- ✅ **Un seul endroit** : Toute la logique de filtrage centralisée
- ✅ **Handlers simples** : Plus besoin de `if (settings.debugX)`

### Mode Offline

Le logger fonctionne **même sans serveur WebSocket** :

- ✅ Logs console toujours fonctionnels
- ❌ Logs serveur ignorés (buffer vidé silencieusement)
- 📢 Messages console informatifs : `"logs will be console-only"`

### Filtrage RAW Packets

**Logique intelligente :**

```javascript
// Dans log() - Buffer pour serveur
if (logEntry.category === 'PACKET_RAW' && !debugRawPacketsServer) {
    return; // Skip server logging for RAW packets
}

// Dans logToConsole() - Affichage console
if (entry.category === 'PACKET_RAW' && !showRawPacketsConsole) {
    return; // Skip console display for RAW packets
}
```

**Résultat :**

- Les RAW packets ne polluent pas les logs normaux
- Activation séparée console vs serveur
- Performance optimale si désactivé

### Buffer et Flush

```javascript
// Buffer automatique
this.buffer.push(logEntry);

// Flush si buffer plein
if (this.buffer.length >= this.maxBufferSize) {
    this.flush(); // Envoie au serveur
}

// Flush périodique (toutes les 5s)
setInterval(() => this.flush(), 5000);
```

---

## ⚠️ Avertissements et Limitations

### RAW Packet Debugging

**⚠️ TRÈS VERBEUX !**

Quand activé, le logger trace **CHAQUE paquet réseau** capturé :

- Peut générer 100+ logs par seconde en combat
- Impact performance en console (affichage lent)
- Fichiers JSONL volumineux (plusieurs Mo par minute)

**Recommandation :**

- ❌ Ne PAS activer en permanence
- ✅ Activer uniquement pour analyser un problème spécifique
- ✅ Désactiver dès que l'analyse est terminée

### Mode Offline

Si le serveur WebSocket n'est pas disponible :

- ✅ Console fonctionne normalement
- ❌ Logs serveur ignorés (pas d'erreur, juste ignorés)
- 📢 Messages dans console : `"logs will be console-only"`

### Performance

- ✅ Pas d'overhead si `settingLogToConsole = false`
- ✅ Filtrage intelligent des RAW packets
- ⚠️ Impact si console ouverte avec beaucoup de logs

---

## 📚 Voir Aussi

- **[DEBUG_LOGGING_GUIDE.md](../../work/DEBUG_LOGGING_GUIDE.md)** - Guide complet debug & logging
- **[AI_AGENT_GUIDE.md](../ai/AI_AGENT_GUIDE.md)** - Guide pour les agents IA
- **[ARCHITECTURE.md](../dev/ARCHITECTURE.md)** - Architecture du projet

---

*Système de Logging v2.0 - Centralisé, Configurable, Performant* 🎉
