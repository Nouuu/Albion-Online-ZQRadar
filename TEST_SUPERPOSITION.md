# 🧪 GUIDE DE TEST - Vérification superposition

**Objectif**: Vérifier que les Fiber vivants disparaissent immédiatement du radar quand tués.

---

## 📋 PRÉPARATION

1. **Recharger le radar** (CTRL+F5) - OBLIGATOIRE
2. **Activer logs living resources** (Settings)
3. **Ouvrir console** (F12)
4. **Aller en zone Fiber** (T3-T5)

---

## 🎯 PROTOCOLE DE TEST

### Test 1: Kill Fiber T3
1. Trouver un Fiber T3 vivant (vert 🌿)
2. Le tuer
3. **Vérifier console** pour les logs:
   ```
   [HarvestablesHandler] 💀 Entity XXXXX killed → removing from living resources
   [MobsHandler] 🗑️ Removed mob XXXXX (living resources: N → N-1)
   ```
4. **Vérifier radar**:
   - ✅ Fiber vivant DISPARAÎT immédiatement
   - ✅ Fiber cadavre APPARAÎT (vert 🌿, récoltable)
   - ❌ PAS de superposition

### Test 2: Kill Fiber T4
Même protocole que Test 1

### Test 3: Kill Fiber T5
Même protocole que Test 1

### Test 4: Kill Hide T3/T4/T5
Vérifier que ça marche aussi pour Hide (pas de régression)

---

## ✅ RÉSULTATS ATTENDUS

### Console
```
[HarvestablesHandler] 💀 Entity 245848 killed → removing from living resources
[MobsHandler] 🗑️ Removed mob 245848 (living resources: 15 → 14)
```

### Radar
```
AVANT kill: Fiber vivant (vert 🌿)
APRÈS kill: Fiber cadavre (vert 🌿 récoltable)
Transition: IMMÉDIATE, sans superposition
```

---

## ❌ PROBLÈMES POSSIBLES

### 1. Superposition persiste
**Symptôme**: Vivant + cadavre affichés en même temps

**Vérifier console**:
- Si `💀 Entity killed` mais PAS `🗑️ Removed` → Le mob n'est pas trouvé dans la liste
- Si aucun des deux logs → L'event `NewHarvestableObject` n'est pas appelé

**Solution**: Me transmettre les logs complets

### 2. Cadavre affiché comme Hide
**Symptôme**: Fiber cadavre s'affiche marron (Hide)

**Cause**: Le fichier n'a pas été rechargé (cache navigateur)

**Solution**: 
- CTRL+SHIFT+DELETE (vider cache)
- CTRL+F5 (hard refresh)

### 3. Fiber vivant invisible
**Symptôme**: Aucun Fiber vert avant kill, seulement cadavre après

**Cause**: Settings living resources désactivés

**Solution**: Activer Fiber T3/T4/T5 dans Settings

---

## 📊 TEMPLATE DE RAPPORT

Si problème, copier/coller ça:

```
Test Fiber TX:
- Vivant visible: OUI/NON
- Logs 💀 Entity killed: OUI/NON
- Logs 🗑️ Removed mob: OUI/NON
- Cadavre visible: OUI/NON
- Cadavre type: Fiber/Hide
- Superposition: OUI/NON (combien de temps ?)
```

---

## 🎯 OBJECTIF FINAL

**0 superposition** - Transition immédiate vivant → cadavre

Si ça fonctionne → **SUCCÈS TOTAL !** 🎉

Si problème persiste → Me transmettre rapport + logs console

