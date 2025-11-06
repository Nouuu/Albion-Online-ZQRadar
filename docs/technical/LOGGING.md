# 📊 Système de Logging & Debug - ZQRadar v2.1

> **Version:** 2.1 (Refactoring catégories debug)
> **Dernière mise à jour:** 2025-11-06
> **Statut:** ✅ Implémenté et fonctionnel
> **Mainteneur:** Nospy

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

## 🏗️ Architecture v2.0

### Composants Principaux

#### 1. **LoggerClient.js** - Cœur du système

- Fichier: `scripts/LoggerClient.js`
- Exposé globalement: `window.logger`
- Fonctionne offline (sans WebSocket)
- Affichage console avec couleurs et émojis
- Buffer pour envoi serveur (optionnel)

#### 2. **Settings.js** - Configuration

- Fichier: `scripts/Utils/Settings.js`
- Propriétés: `logToConsole`, `logToServer`, `debugRawPacketsConsole`, `debugRawPacketsServer`
- Méthode `returnLocalBool(key, defaultValue)` - Support valeurs par défaut

#### 3. **Settings.ejs** - Interface

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

## 📊 API du Logger v2.0

### Méthodes Disponibles

```javascript
// window.logger est disponible globalement sur toutes les pages

// DEBUG - Informations détaillées pour le debug
window.logger.debug(category, event, data, context);

// INFO - Informations générales
window.logger.info(category, event, data, context);

// WARN - Avertissements
window.logger.warn(category, event, data, context);

// ERROR - Erreurs
window.logger.error(category, event, data, context);

// CRITICAL - Erreurs critiques
window.logger.critical(category, event, data, context);
```

### Paramètres

- **category** (string) : Catégorie du log (`MOB`, `HARVEST`, `PACKET_RAW`, etc.)
- **event** (string) : Nom de l'événement (`NewMobEvent`, `HarvestStart`, etc.)
- **data** (object) : Données à logger
- **context** (object, optionnel) : Contexte additionnel

### Catégories Utilisées

| Catégorie         | Événements                                   | Fichiers                       | Contrôlé par                                                     |
|-------------------|----------------------------------------------|--------------------------------|------------------------------------------------------------------|
| `MOB`             | NewMobEvent_RAW, UsingMobInfo                | MobsHandler.js                 | `settingDebugEnemies`                                            |
| `MOB_HEALTH`      | HealthUpdate, RegenerationHealthChanged      | Utils.js, MobsHandler.js       | `settingDebugEnemies`                                            |
| `HARVEST`         | HarvestStart, HarvestCancel, ItemIdDiscovery, NewLivingCreature | MobsHandler.js, HarvestablesHandler.js | `settingDebugHarvestables`        |
| `HARVEST_HIDE_T4` | Detection, Update, SettingsCheck             | HarvestablesHandler.js         | `settingDebugHarvestables` (toujours pour T4+)                   |
| `PACKET_RAW`      | Event_* (tous les événements)                | Utils.js                       | `settingDebugRawPacketsConsole` / `settingDebugRawPacketsServer` |

### Exemples d'Utilisation

```javascript
// Dans MobsHandler.js
if (settings.debugEnemies) {
    window.logger.debug('MOB', 'NewMobEvent_RAW', {
        id: mobId,
        typeId: typeId,
        health: health,
        position: {x, y}
    });
}

// Dans HarvestablesHandler.js
window.logger.info('HARVEST', 'HarvestStart', {
    harvestableId: id,
    tier: tier,
    enchantment: enchant
}, {
    mapId: currentMap
});

// Debug RAW packets (Utils.js)
if (settings.debugRawPacketsConsole || settings.debugRawPacketsServer) {
    window.logger.debug('PACKET_RAW', `Event_${eventCode}`, {
        id: id,
        eventCode: eventCode,
        allParameters: Parameters
    });
}
```

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

### ⚠️ Règle de Filtrage Stricte

```javascript
// ✅ CORRECT - INFO/WARN/ERROR toujours loggés
if (window.logger) {
    window.logger.info('ACTION', 'Important', {data});
    window.logger.warn('WARNING', 'Anomaly', {details});
    window.logger.error('ERROR', 'Critical', error);
}

// ✅ CORRECT - DEBUG filtré par setting
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'DetailedParams', {allParams});
}

// ❌ INCORRECT - INFO ne doit PAS être filtré
if (this.settings.debugMode && window.logger) {
    window.logger.info('ACTION', 'Important', {data}); // ERREUR : INFO doit toujours être loggé
}
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

### Pour le Développeur

#### Ajouter des Logs dans le Code

```javascript
// 1. Vérifier que window.logger est disponible
if (window.logger) {
    // 2. Choisir le niveau approprié
    window.logger.debug('CATEGORY', 'EventName', {
        data1: value1,
        data2: value2
    }, {
        // Contexte optionnel
        additionalInfo: 'some context'
    });
}

// 3. Respecter les conventions
// - category: UPPERCASE (MOB, HARVEST, PACKET_RAW, etc.)
// - event: PascalCase (NewMobEvent, HarvestStart, etc.)
// - data: objet structuré
// - context: optionnel, pour infos additionnelles
```

#### Conditionner les Logs selon Settings

```javascript
// Vérifier le setting approprié avant de logger
if (settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'EventName', {...});
}

if (settings.debugHarvestables && window.logger) {
    window.logger.debug('HARVEST', 'EventName', {...});
}

// Pour RAW packets, le logger gère le filtrage automatiquement
if ((settings.debugRawPacketsConsole || settings.debugRawPacketsServer) && window.logger) {
    window.logger.debug('PACKET_RAW', `Event_${code}`, {...});
}
```

---

## 📊 Bonnes Pratiques

### 1. Choisir le Bon Niveau

**DEBUG** - Détails techniques et verbeux

```javascript
// Tous les paramètres d'un événement
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'NewMobEvent_ALL_PARAMS', {
        mobId, typeId, allParameters
    });
}
```

**INFO** - Actions importantes (TOUJOURS loggé)

```javascript
// Chargement de données, découvertes
if (window.logger) {
    window.logger.info('MOB', 'LoadMetadata', {
        count: this.metadata.length
    });
}
```

**WARN** - Situations anormales (TOUJOURS loggé)

```javascript
// Données manquantes, cache vide
if (window.logger) {
    window.logger.warn('HARVEST', 'NoCacheWarning', {
        note: 'Resource tracking may be incomplete'
    });
}
```

**ERROR** - Erreurs critiques (TOUJOURS loggé)

```javascript
// Exceptions, échecs de chargement
if (window.logger) {
    window.logger.error('MOB', 'LoadMetadataFailed', error);
}
```

### 2. Respecter les Règles de Filtrage

- ✅ DEBUG → Filtré par settings (`debugEnemies`, `debugFishing`, etc.)
- ✅ INFO/WARN/ERROR → **TOUJOURS** loggés (pas de condition sur settings)

### 3. Utiliser les Settings Appropriés

Chaque composant a son setting de debug :

- Enemies/Mobs → `debugEnemies`
- Players → `debugPlayers`
- Harvestables/Resources → `debugHarvestables`
- Fishing → `debugFishing`
- Chests → `debugChests`
- Dungeons → `debugDungeons`

### 4. Exemples de Patterns

```javascript
// ✅ Pattern correct pour DEBUG
if (this.settings.debugEnemies && window.logger) {
    window.logger.debug('MOB', 'DetailedEvent', {data});
}

// ✅ Pattern correct pour INFO/WARN/ERROR
if (window.logger) {
    window.logger.info('MOB', 'ImportantAction', {data});
}

// ❌ Pattern INCORRECT
if (this.settings.debugEnemies && window.logger) {
    window.logger.info(...); // INFO ne doit PAS être filtré !
}
```

---

## 🔧 Fonctionnement Interne

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
