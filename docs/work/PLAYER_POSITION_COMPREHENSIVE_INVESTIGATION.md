# 🎯 Investigation Complète - Affichage des Joueurs

**Date**: 2025-11-09
**Status**: 🔴 **EN COURS** - Les joueurs ne s'affichent pas sur le radar
**Objectif**: Afficher la position des autres joueurs sur le radar

---

## 📊 État Actuel

### ✅ Ce qui fonctionne
- Détection des joueurs (NewCharacter events)
- Position du joueur local (lpX/lpY via request packets)
- Position des MOBs/NPCs (Move events avec param[4]/[5] ou Buffer offsets 12-19)
- Position des ressources statiques/vivantes
- Logger et système de debug

### ❌ Ce qui ne fonctionne PAS
- **Les autres joueurs ne s'affichent PAS sur le radar**
- Les coordonnées dans les Move events des joueurs sont corrompues
- Impossible de calculer la position relative des joueurs

---

## 🔬 Différences de Protocole: LOCAL PLAYER vs MOBS vs OTHER PLAYERS

### Tableau Récapitulatif

| Aspect | LOCAL PLAYER | MOBS/NPCs | OTHER PLAYERS |
|--------|--------------|-----------|---------------|
| **Type de packet** | `request` (param[253]=21) | `event` (param[252]=3) | `event` (param[252]=3) |
| **param[1] type** | Array `[x, y]` | Buffer (30 bytes) | Buffer (30 bytes) |
| **param[4] / param[5]** | ✅ Valides (floats) | ✅ Valides (floats) | ❌ **CORROMPUS** (2.733e-9, 1.625e-25) |
| **param[19] / param[20]** | ❌ Absents | ❌ Absents | ✅ **Coordonnées MONDE** |
| **Buffer offsets 12-19** | N/A (pas de Buffer) | ✅ **Contient X/Y** | ❌ Valeurs absurdes (762387, -0.000) |

### Patterns Observés dans les Logs

#### 1. LOCAL PLAYER - Request Packet (param[253]=21)
```javascript
{
  "param[1]": [123.45, 678.90],  // Array avec X, Y
  "param[253]": 21                // Request type
}
// ✅ lpX/lpY sont mis à jour directement depuis param[1]
```

#### 2. MOB/NPC - Move Event (EventCode 3)
```javascript
{
  "param[0]": 133233,                              // Entity ID
  "param[1]": { type: "Buffer", data: [0x00...] }, // 30 bytes
  "param[4]": -292.92,                             // ✅ Camera X (valide)
  "param[5]": 77.69,                               // ✅ Camera Y (valide)
  "param[19]": undefined,                          // ❌ Pas de world coords
  "param[20]": undefined,
  "param[252]": 3                                  // EventCode Move
}

// Décodage Buffer offsets 12-19:
// Float32 LE @ offset 12 = -292.92  (Camera X)
// Float32 LE @ offset 16 = 77.69    (Camera Y)
```

#### 3. OTHER PLAYER - Move Event (EventCode 3)
```javascript
{
  "param[0]": 179095,                              // Entity ID (joueur)
  "param[1]": { type: "Buffer", data: [0x00...] }, // 30 bytes
  "param[4]": 2.733e-9,                            // ❌ CORROMPU!
  "param[5]": 1.625e-25,                           // ❌ CORROMPU!
  "param[19]": 114.93,                             // ✅ World X (valide mais inutilisable)
  "param[20]": 9.35,                               // ✅ World Y (valide mais inutilisable)
  "param[252]": 3                                  // EventCode Move
}

// Décodage Buffer offsets 12-19:
// Float32 LE @ offset 12 = 762387.0   (Absurde!)
// Float32 LE @ offset 16 = -0.000     (Absurde!)
```

---

## 🧪 Tests Effectués et Résultats

### ❌ Test 1: Buffer offsets 12-19 (comme pour les MOBs)
**Hypothèse**: Les joueurs utilisent le même format Buffer que les mobs
**Méthode**: Décoder Buffer param[1] aux offsets 12-19 en float32 LE
**Résultat**: ❌ **ÉCHEC** - Valeurs absurdes (762387, -0.000)
**Conclusion**: Format Buffer différent pour joueurs vs mobs

### ❌ Test 2: Conversion World → Camera (param[19]/[20] - lpX/lpY)
**Hypothèse**: `cameraX = worldX - lpX` et `cameraY = worldY - lpY`
**Méthode**: Soustraire lpX/lpY des coordonnées monde (param[19]/[20])
**Test de vérification avec MOB**:
```javascript
// MOB (133233):
worldX = 113.38, worldY = -83.89
cameraX = -292.92, cameraY = 77.69

// Calcul inverse:
lpX = worldX - cameraX = 113.38 - (-292.92) = 406.30
lpY = worldY - cameraY = -83.89 - 77.69 = -161.58

// Valeur réelle lpX/lpY dans les logs: ~0.0 / ~0.0
// ❌ Différence de 400+, formule ne marche PAS
```
**Résultat**: ❌ **ÉCHEC** - La formule ne correspond pas
**Conclusion**: Les coordonnées monde et caméra n'utilisent pas un simple offset

### ❌ Test 3: param[16] et param[17] Buffers
**Hypothèse**: Autres Buffers peuvent contenir les coordonnées caméra
**Méthode**: Décoder param[16] et param[17] en float32 LE
**Résultat**:
```javascript
param[16] offsets 0-3: 2.733e-9    // ← Identique à Move param[4]!
param[16] offsets 4-7: 1.625e-25   // ← Identique à Move param[5]!
```
**Conclusion**: ❌ param[16]/[17] sont la **SOURCE** des valeurs corrompues

### ❌ Test 4: param[7] Buffer (16 bytes)
**Hypothèse**: Un autre Buffer pourrait contenir les coords
**Méthode**: Décoder param[7] en float32 LE
**Résultat**: Valeurs astronomiques (0.0146, 2005.31)
**Conclusion**: ❌ Pas des coordonnées spatiales

### ❌ Test 5: MOB comme référence
**Hypothèse**: Si un MOB est visible, calculer position monde du joueur local
**Méthode**: `localPlayerWorldX = mob.worldX - mob.cameraX`
**Problème découvert**: Aucune entité n'a **à la fois** world coords ET camera coords!
```javascript
// Résultat de l'analyse:
Entités avec camera coords valides (MOBs): 17
Entités avec world coords ET camera coords: 0
```
**Conclusion**: ❌ Impossible - données fragmentées intentionnellement

---

## 🎯 Découverte Critique

### Fragmentation Intentionnelle du Protocole

```
ENTITÉ              WORLD COORDS       CAMERA COORDS      AFFICHAGE RADAR
------------------- ------------------ ------------------ -----------------
Local Player        ❌ Non transmises   ✅ lpX/lpY         ✅ Centre (0,0)
Autres Joueurs      ✅ param[19]/[20]   ❌ Corrompues      ❌ IMPOSSIBLE
MOBs/NPCs           ❌ Non transmises   ✅ param[4]/[5]    ✅ Fonctionne
```

**Interprétation**:
- Le protocole sépare **intentionnellement** les coordonnées monde et caméra
- Pour afficher un joueur sur le radar, il faut **les deux types de coordonnées**
- Le serveur ne les envoie **JAMAIS ensemble** pour la même entité
- Ceci empêche la création de radars par simple packet sniffing

---

## 🔧 Mode DEEP DEBUG

Pour une analyse exhaustive, un mode de debug approfondi est disponible:

### Activation
1. Ouvrir l'interface Settings dans ZQRadar
2. Activer **"Debug Players"** dans la section Debug
3. Les logs captureront **TOUS** les paramètres des Move events des joueurs

### Ce qui est loggé
```javascript
{
  category: "PLAYER",
  event: "DEEP_DEBUG_Move",
  data: {
    id: 179095,                    // Entity ID du joueur
    timestamp: 1731164523456,      // Moment du Move event
    lpX: 123.45,                   // Position locale X au moment du Move
    lpY: 678.90,                   // Position locale Y au moment du Move
    allParameters: {
      "param[0]": 179095,
      "param[1]": { ... },         // Buffer 30 bytes
      "param[2]": ...,
      ...
      "param[252]": 3              // TOUS les 253 paramètres!
    },
    parameterCount: 24
  }
}
```

### Comment analyser
1. Collecter 10-20 Move events pour le même joueur
2. Comparer **tous** les paramètres entre chaque Move
3. Identifier lesquels changent de manière cohérente avec le mouvement
4. Tester tous les offsets du Buffer param[1] dans tous les formats possibles:
   - Float32 LE/BE à tous les offsets (0, 4, 8, 12, 16, 20, 24, 28)
   - Int32 LE/BE
   - Int16 LE/BE
   - UInt16/UInt32
   - Float64

### Scénarios de Test Recommandés
1. **Joueur immobile**: Identifier les paramètres constants vs variables
2. **Joueur en mouvement**: Voir quels params changent proportionnellement
3. **Nous bougeons**: Vérifier si params des autres joueurs réagissent
4. **Plusieurs joueurs**: Comparer params entre joueurs simultanément

---

## 📋 Checklist des Paramètres à Investiguer

### ✅ Déjà testés (FAIL)
- [x] param[4] / param[5] - Corrompus pour joueurs
- [x] param[19] / param[20] - World coords (non convertibles)
- [x] param[1] Buffer offsets 12-19 - Valeurs absurdes
- [x] param[16] / param[17] - Source des valeurs corrompues
- [x] param[7] - Valeurs astronomiques
- [x] Formule World→Camera - Ne marche pas

### ❓ Pas encore testés
- [ ] param[2], param[3] - Que contiennent-ils?
- [ ] param[6], param[8] through param[15]
- [ ] param[18]
- [ ] param[21] through param[251]
- [ ] Buffer param[1] - Autres offsets (0-11, 20-29)
- [ ] Buffer param[1] - Autres formats (int16, uint16, etc.)
- [ ] Analyse temporelle - Évolution des params sur Move events consécutifs
- [ ] Corrélation - Relation entre params et distance lpX/lpY

---

## 🚀 Plan d'Action pour Continuer

### Option A: Analyse Exhaustive (DEEP DEBUG)
**Effort**: 2-3 heures
**Probabilité de succès**: 30-40%

1. Activer `settingDebugPlayers` dans Settings
2. Capturer Move events de joueurs dans un environnement contrôlé
3. Analyser exhaustivement TOUS les paramètres
4. Tester TOUS les offsets de Buffer dans TOUS les formats
5. Si coordonnées trouvées → Implémenter, sinon → Abandonner

**Critères de succès**:
- Coordonnées dans range raisonnable (-500 < x < 500)
- Changent de manière cohérente entre Move events
- Distance entre joueurs cohérente visuellement
- Fonctionne pour plusieurs joueurs
- Stable pendant 1+ minute

### Option B: Accepter la Limitation
**Effort**: 30 minutes (documentation)
**Probabilité**: 100%

1. Documenter clairement que l'affichage joueurs est impossible par packet sniffing
2. Expliquer la fragmentation intentionnelle du protocole
3. Marquer la feature comme "non implémentable"
4. Documenter alternatives possibles (memory reading, DLL injection)

### Option C: Approche Alternative (Advanced)
**Effort**: 10-20 heures
**Probabilité de succès**: 70-90%

1. Memory reading: Lire directement la mémoire du client Albion
2. DLL injection: Injecter code dans le processus pour hook les fonctions
3. Analyse plus profonde du protocole Photon (reverse engineering)

**⚠️ Attention**: Ces approches sont plus invasives et risquent de violer les ToS

---

## 💭 Recommandation

**Je recommande Option A (DEEP DEBUG) comme dernière tentative** parce que:

1. ✅ Infrastructure déjà en place (logging exhaustif intégré)
2. ✅ Rapide à tester (2-3 heures max)
3. ✅ Peut révéler des patterns qu'on a manqués
4. ✅ Si ça échoue, on aura une certitude absolue

**Si Option A échoue** → Passer à Option B et documenter clairement la limitation

**Option C** devrait être considérée seulement si l'utilisateur le demande explicitement et comprend les risques.

---

## 📚 Références Techniques

### Buffer Decoding (Browser-compatible)
```javascript
function decodeBuffer(bufferParam, offset, format = 'float32', littleEndian = true) {
    if (!bufferParam || bufferParam.type !== 'Buffer') return null;

    const buffer = new Uint8Array(bufferParam.data);
    const dv = new DataView(buffer.buffer);

    switch (format) {
        case 'float32':
            return dv.getFloat32(offset, littleEndian);
        case 'float64':
            return dv.getFloat64(offset, littleEndian);
        case 'int32':
            return dv.getInt32(offset, littleEndian);
        case 'int16':
            return dv.getInt16(offset, littleEndian);
        case 'uint16':
            return dv.getUint16(offset, littleEndian);
        case 'uint32':
            return dv.getUint32(offset, littleEndian);
        default:
            return null;
    }
}
```

### Validation Position
```javascript
function isValidPosition(x, y) {
    return typeof x === 'number' && typeof y === 'number' &&
           isFinite(x) && isFinite(y) &&
           Math.abs(x) < 10000 && Math.abs(y) < 10000;
}
```

### Conversion Radar Coords
```javascript
// Si on trouve cameraX/cameraY pour un joueur:
const radarX = -cameraX;  // Inverser X
const radarY = cameraY;   // Garder Y
const distance = Math.sqrt(cameraX * cameraX + cameraY * cameraY);
```

---

## 📝 Historique des Sessions

### Session 2025-11-08
- Implémentation Buffer decoding pour MOBs
- Tests avec plusieurs hypothèses
- Découverte de la fragmentation du protocole
- Création du système DEEP DEBUG

### Session 2025-11-09
- Consolidation de la documentation
- Intégration DEEP DEBUG dans Settings existants
- Proposition plan d'action final

---

## 🎓 Enseignements

### Ce qu'on a appris
1. Photon Network Protocol utilise 3 types de packets: event, request, response
2. Les Move events ont des formats différents selon le type d'entité
3. Le protocole fragmente intentionnellement les données sensibles
4. Le Buffer param[1] a des structures différentes (mobs vs joueurs)
5. Les coordonnées monde (param[19]/[20]) et caméra (param[4]/[5]) sont TOUJOURS séparées

### Ce qu'on ne sait toujours pas
1. Pourquoi param[4]/[5] sont corrompus pour les joueurs?
2. Y a-t-il d'autres paramètres contenant les camera coords?
3. Le Buffer param[1] a-t-il un format spécial pour les joueurs?
4. Est-ce que d'autres EventCodes contiennent les données manquantes?
5. Les coordonnées sont-elles encodées/chiffrées?

---

**Dernière mise à jour**: 2025-11-09
**Prochaine étape**: Activer DEEP DEBUG et analyser exhaustivement