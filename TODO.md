# 📋 TODO

**Dernière mise à jour**: 2025-11-02  
**État**: 🔧 Amélioration détection enchantements en cours

> 📖 **Détails techniques**: [DEV_NOTES.md](DEV_NOTES.md) | **Outils**: [tools/](tools/)  
> 🎯 **Nouveau**: [Mode Overlay](OVERLAY_MODE.md) - Fenêtre popup pour le radar

---

## 📊 ÉTAT ACTUEL

### ✅ Ce qui fonctionne
- **Hide/Fiber .0 (non enchantés)** : 100% détection
  - Hide T1/T3/T4/T5 (TypeID 421/423/425/427) ✅
  - Fiber T3/T4/T5 (TypeID 528/530/531) ✅
- **Cache localStorage** : Fonctionnel (cross-référence HarvestablesHandler)
- **Filtrage settings** : Par Tier + Enchant opérationnel
- **Fiber vivants T5** : Détection fiable ✅
- **🆕 Mode Overlay** : Fenêtre popup avec contrôle d'opacité ✅

### ❌ Problèmes identifiés
- **Enchantements T5+ : 90% NON DÉTECTÉS sur le radar**
  - Cause: Formule `calculateEnchantmentFromRarity()` incorrecte
  - TypeIDs enchantés manquants dans MobsInfo.js
  - Observations terrain:
    - Hide T4e0 parfois détecté comme T4e1 ❌
    - Hide T5e3 parfois détecté comme T5e0 ❌
    - Hide T5e1 fonctionne ✅
    - Fiber T4e0/e1/e2 fonctionnent ✅

### 🔧 Correctif appliqué (2025-11-02 23:XX)
- **Nouvelle formule rarity → enchantement**
  ```javascript
  Base rarity par tier: T4=92, T5=112, T6=132...
  Calcul: diff = rarity - base
  - e0: diff < 20
  - e1: diff < 65  (≈ base + 45)
  - e2: diff < 110 (≈ base + 90)
  - e3: diff < 155 (≈ base + 145)
  - e4: diff >= 155
  ```

### 🔄 Derniers changements (2025-11-02)
- ✅ Refactoring formule enchantement (tier-based)
- ✅ Suppression doublon système apprentissage
- ✅ Nettoyage fichiers de travail temporaires
- ✅ Règles strictes DOCS_GUIDE.md

---

## ✅ TERMINÉ

- ✅ Base de données TypeIDs complète (235 TypeIDs)
- ✅ Fiber/Hide detection fonctionnelle
- ✅ Override bugs serveur Albion (TypeID 528/530/531)
- ✅ Cache localStorage + Clear button
- ✅ Outils d'analyse (tools/)
- ✅ Documentation organisée

---

## 🔄 PROCHAINES ÉTAPES

### 🔥 URGENT (immédiat)
1. **COLLECTER TypeIDs Skinnable (animaux) ENCHANTÉS**
   - 🔍 **Découverte**: Pour Skinnable, le jeu envoie des valeurs `enchant` et `rarity` **CONSTANTES** par TypeID
   - Exemple: TOUS les TypeID 425 envoient `enchant=1, rarity=137` (peu importe l'enchant réel)
   - ✅ **Solution**: Enrichir MobsInfo.js avec enchantement en 4ème paramètre
   - ❌ **Manque**: TypeIDs pour Hide/Fiber .1/.2/.3 (seulement .0 actuellement)
   
   **Comment collecter**:
   ```
   1. Aller en zone avec animaux enchantés (Hide T4/T5 .1/.2/.3)
   2. Tuer un animal ET noter son VRAI enchantement (cadavre)
   3. Regarder dans logs: "reportedTypeId":XXX
   4. Mapper: TypeID XXX → Hide T4e1 (par exemple)
   ```

2. **Alternative: Scraper base de données communautaire**
   - Script créé: `tools/scrape_albiononline2d_mobs.py`
   - Script créé: `tools/fetch_ao_data.py`
   - Chercher GitHub: broderickhyman/ao-bin-dumps
   - Chercher API: AlbionOnline2D.com

3. **TEST actuel avec enchant=0 par défaut**
   - Recharger app (F5)
   - Tous Skinnable affichés comme .0 (correct pour TypeIDs actuels)
   - Harvestable (Fiber) utilisent calcul rarity (devrait marcher)

### Court terme (cette semaine)
- [ ] **Session terrain validation** (2h)
  - Zones T4-T5 enchantés
  - Valider formule rarity
  - Collecter statistiques précises
  
- [ ] **Enrichir MobsInfo.js**
  - Ajouter TypeIDs enchantés collectés
  - Validation avec BDD communautaire si possible

### Moyen terme
- [ ] Scraping bases de données officielles Albion
  - https://albiononline2d.com/ (discuté)
  - Autres sites communautaires
- [ ] EventNormalizer (Phase 3) - seulement si nécessaire

---

## 📋 GUIDE DE COLLECTE TypeID ENCHANTÉS

### Préparation
```
✅ Settings → Debug → Cocher "🔍 Log Living Resources (JSON)"
✅ Console (F12) ouverte
✅ Aller en zone T4/T5 Hide ou Fiber
```

### Pendant la session
```
1. Tuer des ressources ENCHANTÉES (.1, .2, .3)
2. Repérer dans les logs JSON:
   "reportedTypeId": XXX  ← Noter ce TypeID
   "name": "Hide" ou "Fiber"
   "tier": 4 ou 5
3. Corréler: TypeID → Type/Tier que vous venez de tuer
```

### Format à collecter
```
TypeID 426 → Hide T4.1
TypeID 432 → Hide T4.2  
TypeID 428 → Hide T5.1
TypeID 535 → Fiber T5.1
... etc
```

### Après collecte
- Donner la liste des TypeID collectés
- Mise à jour MobsInfo.js (30 min)
- Test validation (1h)

---
  - Logs `[UNKNOWN_LIVING?]` activés pour identifier TypeID
  - Environ 30+ TypeID à collecter (T4-T5 .1/.2/.3 pour Hide/Fiber)
  
- [ ] **Session longue terrain (2h+)** avec logging CSV activé
  - Collecter données complètes Fiber/Hide/Wood/Ore/Rock
  - Analyser stabilité et performance
  - Vérifier charges restantes vs bonus récolte
  
- [ ] **Analyser nécessité EventNormalizer**
  - Évaluer si les corrections actuelles suffisent
  - Décision basée sur résultats session longue

### Moyen/Long terme
- [ ] Décision EventNormalizer (après analyse session longue)
- [ ] Métriques de qualité
- [ ] Feature flags

---

## 📊 ÉVALUATION EventNormalizer

**Objectif**: Déterminer si EventNormalizer est encore nécessaire avec les changements récents

### ✅ Corrections déjà appliquées
1. **Override TypeID bugs serveur** (528/530/531) via mobinfo priority
2. **Cache localStorage** des TypeID mappings
3. **Logging structuré** (JSON + CSV) pour analyse
4. **Base de données complète** (235 TypeIDs)

### ❓ Questions à résoudre via session longue
1. **Faux positifs**: Combien de TypeID encore mal classés ?
2. **Performance**: Ralentissements avec cache activé ?
3. **Stabilité**: Race conditions dans quels % de cas ?
4. **"Superposition"**: Gênant ou acceptable (objets différents) ?

### 🎯 Critères de décision

**EventNormalizer NÉCESSAIRE si** :
- [ ] > 10% de TypeID encore mal classés après session
- [ ] Race conditions fréquentes (> 5% des spawns)
- [ ] Superposition gênante gameplay
- [ ] Instabilité cache localStorage

**EventNormalizer PAS NÉCESSAIRE si** :
- [ ] < 5% de TypeID problématiques
- [ ] Rare conditions rares (< 2%)
- [ ] Superposition acceptable
- [ ] Système actuel stable

> **Décision après session 2h+ avec logging CSV complet**

---

## ⚠️ LIMITATIONS (Serveur Albion)

1. **Charges restantes**: Affichage incorrect (serveur compte bonus récolte)
   - Fix: Impossible (données manquantes côté serveur)
   
2. **"Superposition"**: Ressources en groupe ont des entityId différents
   - Comportement normal du jeu (pas un bug)

3. **TypeID Fiber**: Serveur envoie typeNumber incorrect (16 au lieu de 14)
   - Fix: Override mobinfo ✅

4. **Hide/Fiber ENCHANTÉS (.1+)**
   - Cause: TypeID uniques par enchantement (inconnus)
   - Exemple: Hide T4.0 (TypeID 425) ✅, T4.1/T4.2 (TypeID ???) ❌
   - Impact: Filtres T4.2+ et T5.1+ non fonctionnels
   - Solution: Collecte manuelle nécessaire (session terrain avec logs)

> Détails: [DEV_NOTES.md](DEV_NOTES.md) section "Comportement attendu"

---

## 📚 DOCUMENTATION

- **README.md** - Guide utilisateur
- **DEV_NOTES.md** - Documentation technique complète
- **DOCS_GUIDE.md** - Navigation
- **tools/** - Scripts d'analyse et vérification
- **README.md** - Documentation utilisateur

---

Fin du TODO.


        // 👇 NOUVEAU BLOC - Logging spécifique pour Living Resources
        if (this.settings.logLivingCreatures) {
            if (h.type == EnemyType.LivingSkinnable || h.type == EnemyType.LivingHarvestable) {
                const typeLabel = h.type == EnemyType.LivingSkinnable ? "LivingSkinnable" : "LivingHarvestable";
                console.log(`🔍 LIVING RESOURCE FOUND:`);
                console.log(`   Type: ${typeLabel}`);
                console.log(`   Name: ${h.name}`);
                console.log(`   Tier: ${h.tier}`);
                console.log(`   TypeID: ${typeId}`);
                console.log(`   Health: ${health} ${health > 0 ? '(ALIVE ✅)' : '(DEAD ❌)'}`);
                console.log(`   Enchant: ${enchant}`);
            }
        }
        // 👆 FIN NOUVEAU BLOC

        if (h.type == EnemyType.LivingSkinnable)
        {
            /* ... reste du code inchangé ... */
```

**Alternative - Logging amélioré avec formatage CSV** :

Ajouter une méthode helper dans la classe `MobsHandler` :

```javascript
// 👇 NOUVELLE MÉTHODE - À ajouter après le constructeur (ligne ~75)
logLivingCreatureCSV(id, typeId, health, enchant, rarity, tier, type, name)
{
    const typeLabel = type == EnemyType.LivingSkinnable ? "Skinnable" : "Harvestable";
    const isAlive = health > 0 ? "ALIVE" : "DEAD";
    const timestamp = new Date().toISOString();
    
    console.log(`[LIVING_RESOURCE] ${timestamp},${typeId},${tier},${name},${typeLabel},${enchant},${health},${isAlive}`);
}
```

Puis l'utiliser dans `AddEnemy` :

```javascript
if (this.settings.logLivingCreatures) {
    if (h.type == EnemyType.LivingSkinnable || h.type == EnemyType.LivingHarvestable) {
        this.logLivingCreatureCSV(id, typeId, health, enchant, rarity, h.tier, h.type, h.name);
    }
}
```

---

### 3️⃣ `views/main/resources.ejs`

**Ligne ~847** - Ajouter une checkbox dans la section Debug :

```html
<!-- Après settingLivingResourcesID -->
<label class="flex items-center">
    <input type="checkbox" id="settingLivingResourcesID" class="h-5 w-5 text-indigo-600 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
    <span id="id-text" class="dark:text-white ml-2">Show ID</span>
</label>

<!-- 👇 NOUVEAU -->
<label class="flex items-center">
    <input type="checkbox" id="settingLogLivingCreatures" class="h-5 w-5 text-indigo-600 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
    <span class="dark:text-white ml-2">🔍 Log Living Creatures to Console</span>
</label>
```

**Ligne ~1850** - Ajouter le script d'initialisation :

```javascript
// Après settingLivingResourcesID
let settingLivingResourcesID = document.getElementById("settingLivingResourcesID");
settingLivingResourcesID.checked = returnLocalBool("settingLivingResourcesID");
settingLivingResourcesID.addEventListener("click", () => {localStorage.setItem("settingLivingResourcesID", settingLivingResourcesID.checked);});

// 👇 NOUVEAU
let settingLogLivingCreatures = document.getElementById("settingLogLivingCreatures");
settingLogLivingCreatures.checked = returnLocalBool("settingLogLivingCreatures");
settingLogLivingCreatures.addEventListener("click", () => {
    localStorage.setItem("settingLogLivingCreatures", settingLogLivingCreatures.checked);
    if (settingLogLivingCreatures.checked) {
        console.log("🔍 Living Creatures Logging ENABLED");
        console.log("📋 CSV Header: Timestamp,TypeID,Tier,Name,Type,Enchant,Health,State");
    } else {
        console.log("🔍 Living Creatures Logging DISABLED");
    }
});
```

---

### 4️⃣ `scripts/Utils/languages/english.json`

**Ligne ~52** - Ajouter la traduction :

```json
"debug": "Debug",
"size": "Show Size",
"health": "Show Health",
"id": "Show ID",
"log-living": "Log Living Creatures"
```

**Optionnel** - Ajouter dans les autres fichiers de langue (`french.json`, `russian.json`, etc.)

---

## 🧪 Tests à effectuer

### Checklist de validation

- [ ] Le checkbox "Log Living Creatures" apparaît dans l'UI
- [ ] Le paramètre se sauvegarde dans le localStorage
- [ ] Activer le logging affiche un message de confirmation dans la console
- [ ] Les logs apparaissent quand on rencontre des créatures
- [ ] Les logs contiennent toutes les informations nécessaires :
    - TypeID
    - Tier
    - Name (fiber, hide, Logs, ore, rock)
    - Type (Skinnable ou Harvestable)
    - Enchant level
    - Health
    - État (ALIVE/DEAD)

### Scénarios de test

1. **Test basique**
    - Activer le logging
    - Se déplacer en jeu
    - Vérifier que les créatures sont loggées

2. **Test des différents types**
    - Tester dans différents biomes (Forest, Mountain, Swamp, etc.)
    - Vérifier fiber, hide, wood, ore, rock
    - Tester différents tiers (T3, T4, T5, etc.)

3. **Test vivant/mort**
    - Logger une créature vivante
    - Tuer la créature
    - Vérifier si un nouveau log apparaît pour l'état mort

---

## 📊 Format de collecte des données

### Template pour noter les IDs découverts

Créer un fichier `LIVING_RESOURCES_IDS.md` :

```markdown
# Living Resources IDs Database

## Fiber (Living Harvestable)
- T3 ALIVE: TypeID ?
- T3 DEAD: TypeID 634 ✅
- T4 ALIVE: TypeID ?
- T4 DEAD: TypeID 635 ✅
- ...

## Hide (Living Skinnable)
### Rabbits
- T1 ALIVE: TypeID ?
- T1 DEAD: TypeID ?
### Fox
- T2 ALIVE: TypeID ?
- T2 DEAD: TypeID ?
...

## Wood (Living Harvestable)
...

## Ore (Living Harvestable)
...

## Rock (Living Harvestable)
...
```

---

## 🔄 Workflow de collecte

1. **Activer le logging** dans les paramètres
2. **Ouvrir la console** du navigateur (F12)
3. **Se déplacer en jeu** dans différentes zones
4. **Copier les logs** régulièrement
5. **Noter les TypeIDs** dans le fichier de tracking
6. **Répéter** pour tous les biomes et tiers

### Commande console utile

Pour filtrer uniquement les living resources dans la console :

```javascript
// Coller ça dans la console pour filtrer
console.log("=== FILTERED LIVING RESOURCES ===");
// Les logs avec [LIVING_RESOURCE] seront facilement identifiables
```

---

## 📝 Notes importantes

### Ce qui NE sera PAS fait en Phase 1
- ❌ Pas d'affichage graphique sur le radar
- ❌ Pas de distinction visuelle vivant/mort
- ❌ Pas de filtres UI pour activer/désactiver par type
- ❌ Pas de modification de `MobsInfo.js` (collecte uniquement)

### Ce qui SERA fait en Phase 1
- ✅ Système de logging fonctionnel
- ✅ Checkbox UI pour activer/désactiver
- ✅ Logs détaillés avec toutes les infos
- ✅ Format CSV pour faciliter l'analyse
- ✅ Base de données d'IDs complète

---

## 🚀 Phase 2 (Prévue après Phase 1)

Une fois les IDs collectés :

1. Ajouter les IDs dans `MobsInfo.js`
2. Créer icônes distinctes pour vivant/mort
3. Ajouter filtres UI
4. Implémenter l'affichage sur le radar
5. Tests complets

### 📚 Référence: Implémentation dans `imp-mob-ids` branch

La branche `imp-mob-ids` montre comment Phase 2 devrait être implémentée:

**Structure Settings.js modernisée:**
```javascript
// ANCIENNE structure (main branch) - À ÉVITER
this.harvestingLivingFiber = {
    e0: [false, false, ...],  // Tiers pour enchant 0
    e1: [false, false, ...],  // Tiers pour enchant 1
    // ...
}

// NOUVELLE structure (imp-mob-ids) - RECOMMANDÉE
this.harvestingLivingFiberTiers = [false, false, false, false, false, false, false, false]; // T1-T8
this.harvestingLivingFiberEnchants = [false, false, false, false, false, false]; // E0-E5
```

**Avantages de la nouvelle structure:**
- ✅ Plus simple à gérer (séparation Tiers/Enchants)
- ✅ Logique de filtrage dans MobsHandler plus lisible
- ✅ localStorage keys plus claires (`settingLivingFiberT3`, `settingLivingFiberE1`)
- ✅ UI plus intuitive avec checkboxes séparées

**Code de référence MobsHandler.js (imp-mob-ids:170-228):**
```javascript
// Exemple pour LivingHarvestable avec type "fiber"
if (h.name == "fiber") {
    if ((!this.settings.harvestingLivingFiberTiers[h.tier-1] ||
         !this.settings.harvestingLivingFiberEnchants[enchant])) {
        this.harvestablesNotGood.push(h);
        return;
    }
}
```

**Pour Phase 1 (logging):**
Si vous voulez être compatible avec `imp-mob-ids`, utilisez la nouvelle structure dès maintenant dans votre logging code.

---

## 📞 Support

Pour toute question ou partage d'IDs découverts :
- GitHub Issues: [Lien vers le repo]
- Discord: [Lien Discord du projet]
- Contact: @Nouuu

---

## ✅ Checklist finale avant commit

- [ ] Tous les fichiers modifiés sont testés
- [ ] Le code compile sans erreur
- [ ] Le logging fonctionne correctement
- [ ] La documentation est à jour
- [ ] Les commentaires sont clairs
- [ ] Le localStorage fonctionne
- [ ] La console affiche les logs au bon format

---

**Bon courage pour la collecte ! 🎮🔍**