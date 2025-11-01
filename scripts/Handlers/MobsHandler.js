const EnemyType =
{
    LivingHarvestable: 0,
    LivingSkinnable: 1,
    Enemy: 2,
    MediumEnemy: 3,
    EnchantedEnemy: 4,
    MiniBoss: 5,
    Boss: 6,
    Drone: 7,
    MistBoss: 8,
    Events: 9,
};

class Mob
{
    constructor(id, typeId, posX, posY, health, enchantmentLevel, rarity)
    {
        this.id = id;
        this.typeId = typeId;
        this.posX = posX;
        this.posY = posY;
        this.health = health;
        this.enchantmentLevel = enchantmentLevel;
        this.rarity = rarity;
        this.tier = 0;
        this.type = EnemyType.Enemy;
        this.name = null;
        this.exp = 0;
        this.hX = 0;
        this.hY = 0;
    }
}

// MIST PORTALS ??
class Mist
{
    constructor(id, posX, posY, name, enchant)
    {
        this.id = id;
        this.posX = posX;
        this.posY = posY;
        this.name = name;
        this.enchant = enchant;
        this.hX = 0;
        this.hY = 0;

        if (name.toLowerCase().includes("solo"))
        {
            this.type = 0;
        }
        else
        {
            this.type = 1;
        }
    }
}

class MobsHandler {
    constructor(settings) {
        this.settings = settings;

        this.mobsList = [];
        this.mistList = [];
        this.mobinfo = {};

        this.harvestablesNotGood = [];

        // 🔗 Cross-reference with HarvestablesHandler
        this.staticResourceTypeIDs = new Map(); // TypeID → {type: 'Fiber'|'Hide'|'Wood'|'Ore'|'Rock', tier: number}

        // (Minimal behavior) No pending/debounce: commit static registrations immediately.
        // This file no longer attempts to suppress or blacklist registrations here.

        // Internal: track last logged registration state to avoid repetitive logs
        this._registrationLogState = new Map(); // typeId -> { type, tier }
        // Internal: dedupe human pretty logs per entity (entityId -> signature)
        this._lastHumanLog = new Map();

        // (no DOM wiring here — UI buttons are bound centrally in Utils.js)
    }

    // New helper: normalize numeric values coming from parameters
    normalizeNumber(value, defaultValue = null) {
        if (value === undefined || value === null) return defaultValue;
        const n = Number(value);
        if (Number.isFinite(n)) return n;
        return defaultValue;
    }

    // New helper: structured NDJSON logger for machine parsing
    structuredLog(event, payload) {
        const record = Object.assign({
            timestamp: new Date().toISOString(),
            module: 'MobsHandler',
            event: event
        }, payload);

        const wantLivingLogs = this.settings && this.settings.logLivingResources;
        if (!wantLivingLogs) return; // nothing to do

        const wantHuman = this.settings && this.settings.logLivingHuman;

        // If user wants JSON output for living logs, emit only NDJSON
        if (!wantHuman) {
            try {
                console.log(JSON.stringify(record));
            } catch (err) {
                console.log(record);
            }
            return;
        }

        // Otherwise wantHuman === true => pretty human output only (no NDJSON for living)
        try {
            if (event !== 'SPAWN' || !payload || !payload.classification || !payload.classification.startsWith('LIVING')) return;

            const time = new Date(record.timestamp).toLocaleTimeString();
            const id = payload.entityId || '';
            const repType = payload.reportedTypeId != null ? payload.reportedTypeId : '';
            const resType = payload.resolvedTypeId != null ? payload.resolvedTypeId : '';
            const resolvedBy = payload.resolvedBy || '';

            // Deduplicate human logs per entity to avoid spamming when only position or frequent updates happen.
            try {
                const sigParts = [payload.classification || '', String(resType), payload.staticInfo ? (payload.staticInfo.type || '') : '', payload.staticInfo ? String(payload.staticInfo.tier || '') : '', String(payload.health || ''), String(payload.enchant || ''), String(payload.rarity || ''), String(payload.resolvedBy || '')];
                const signature = sigParts.join('|');
                const last = this._lastHumanLog.get(id);
                if (last && last.signature === signature) {
                    // nothing changed in significant fields -> skip pretty print
                    return;
                }
                // update last signature and schedule a removal after 5s to allow future reprints
                this._lastHumanLog.set(id, {signature, ts: Date.now()});
                setTimeout(() => {
                    try {
                        this._lastHumanLog.delete(id);
                    } catch (e) {
                    }
                }, 5000);
            } catch (e) { /* non-blocking if dedupe fails */
            }

            const cls = payload.classification || '';
            const health = (payload.health != null) ? payload.health : '';
            const enchant = (payload.enchant != null) ? payload.enchant : null;
            const rarity = (payload.rarity != null) ? payload.rarity : '—';
            const posX = (payload.posX != null) ? payload.posX.toFixed(2) : '—';
            const posY = (payload.posY != null) ? payload.posY.toFixed(2) : '—';
            const emoji = payload.emoji || '';

            // Determine resource subtype for human-readable display (Hide/Fiber/Rock/etc.)
            // resourceSubType: prefer staticInfo.type; fallback: if knownInfo marks LivingSkinnable => 'Hide'
            let resourceSubType = null;
            let name = '';
            let tier = '';
            if (payload.staticInfo && payload.staticInfo.type) {
                resourceSubType = payload.staticInfo.type;
                name = name || payload.staticInfo.type || '';
                tier = tier || (payload.staticInfo.tier != null ? payload.staticInfo.tier : '');
            }

            if ((!name || !tier) && payload.knownInfo && Array.isArray(payload.knownInfo)) {
                tier = payload.knownInfo[0] != null ? payload.knownInfo[0] : '';
                name = payload.knownInfo[2] || '';
                try {
                    if (!resourceSubType && payload.knownInfo[1] === EnemyType.LivingSkinnable) {
                        resourceSubType = 'Hide';
                    }
                } catch (e) { /* ignore */
                }
            }

            // Detect conflicts between known info and static cross-ref
            let conflictNote = '';
            if (payload.knownInfo && payload.staticInfo) {
                try {
                    const knownType = payload.knownInfo[1];
                    const staticTypeLabel = payload.staticInfo.type || '';
                    if (knownType === 0 && staticTypeLabel && staticTypeLabel.toUpperCase() !== 'FIBER' && staticTypeLabel.toUpperCase() !== 'HIDE' && staticTypeLabel.toUpperCase() !== 'WOOD' && staticTypeLabel.toUpperCase() !== 'ORE' && staticTypeLabel.toUpperCase() !== 'ROCK') {
                        conflictNote = `⚠️ CONFLICT known(${payload.knownInfo}) vs static(${JSON.stringify(payload.staticInfo)})`;
                    } else if (knownType !== 0 && staticTypeLabel) {
                        // both present but different classification
                        conflictNote = `⚠️ CONFLICT knownType=${knownType} vs staticType=${staticTypeLabel}`;
                    }
                } catch (e) { /* ignore */
                }
            }

            // Clarify whether the number reported is Enchant or Tier: display both
            const tierDisplay = tier ? `T${tier}` : 'T?';
            const enchantDisplay = (typeof enchant === 'number') ? `e${enchant}` : '';

            const aliveMarker = (typeof health === 'number' && health > 0) ? '✅ ALIVE' : (health === 0 ? '❌ DEAD' : '');

            // Build TypeID description
            let typeIdDesc = `TypeID ${repType}`;
            if (payload.staticInfo) {
                typeIdDesc += ` → STATIC ${payload.staticInfo.type} T${payload.staticInfo.tier}`;
            } else if (payload.knownInfo) {
                typeIdDesc += ` → KNOWN ${name || '?'} T${tier || '?'}`;
            } else {
                typeIdDesc += ` → UNKNOWN (not in mobinfo, not cross-referenced)`;
            }

            // Determine source tag for quick recognition
            let sourceTag = 'HEUR';
            if (payload.resolvedBy === 'retroactive_override') sourceTag = 'RETRO';
            else if (payload.staticInfo) sourceTag = 'STATIC';
            else if (payload.knownInfo) sourceTag = 'KNOWN';

            const subtypeText = resourceSubType ? `${resourceSubType}` : (name ? `${name}` : '');
            // One-line summary (compact)
            const oneLine = `${emoji} [${sourceTag}] ${cls} ${subtypeText ? `- ${subtypeText} ${tierDisplay}` : `${tierDisplay}`} ${resolvedBy ? `(${resolvedBy})` : ''} — ${typeIdDesc} ${enchantDisplay} health=${health} pos=(${posX}, ${posY})`;
            console.log(oneLine);

            // Human-friendly pretty block (single consistent format)
            try {
                const width = 70;
                // Header title: emoji + classification + subtype + tier/enchant + optional resolvedBy
                const resolvedTag = resolvedBy ? `(${resolvedBy})` : '';
                const headerLine = `${emoji} ${cls} ${subtypeText ? `- ${subtypeText}` : ''} ${tierDisplay} ${enchantDisplay} ${resolvedTag}`.trim();

                console.log('┌' + '─'.repeat(width));
                console.log(`│ ${headerLine}`);
                console.log('├' + '─'.repeat(width));
                console.log(`│ ⏰ Time:      ${time}`);
                console.log(`│ 🆔 EntityID:  ${id}`);
                console.log(`│ 🔢 ${typeIdDesc}`);
                // Show both Tier and Enchant explicitly so it's never ambiguous
                console.log(`│ 🏷️ Tier:       ${tierDisplay.replace('T', '') !== '?' ? tierDisplay : 'T?'}` + `   ✨ Enchant: ${enchantDisplay || 'e?'}`);
                console.log(`│ ❤️ Health:     ${health} ${aliveMarker}`);
                console.log(`│ 💎 Rarity:      ${rarity}`);
                console.log(`│ 📍 Position:    (${posX}, ${posY})`);
                if (conflictNote) console.log(`│ ${conflictNote}`);
                console.log('└' + '─'.repeat(width));
            } catch (e) {
                // Fallback: simple line if anything goes wrong
                const oneLineFallback = `${emoji} ${cls} ${subtypeText ? `- ${subtypeText}` : ''} ${tierDisplay} ${enchantDisplay} — ${typeIdDesc} health=${health} pos=(${posX}, ${posY})`;
                console.log(oneLineFallback);
            }
        } catch (e) {
            console.error('Logger pretty-print failed', e);
        }
    }

    // 🔗 Called by HarvestablesHandler to register static resource TypeIDs
    registerStaticResourceTypeID(typeId, typeNumber, tier) {
        // Determine resource type
        const resourceType = this.getResourceTypeFromNumber(typeNumber);
        const existing = this.staticResourceTypeIDs.get(typeId);
        const alreadyHas = !!existing;

        // If nothing to register, skip silently
        if (!resourceType) return;

        // If already registered with same info, suppress noisy logs
        if (alreadyHas && existing.type === resourceType && existing.tier === tier) {
            // No change — skip logging to reduce spam
            return;
        }

        // If already registered but with different type/tier, log that an update occurred
        if (alreadyHas && (existing.type !== resourceType || existing.tier !== tier)) {
            console.log(`[DEBUG registerStaticResourceTypeID] 🔁 UPDATE TypeID ${typeId}: ${existing.type} T${existing.tier} -> ${resourceType} T${tier}`);
            this.staticResourceTypeIDs.set(typeId, {type: resourceType, tier: tier});
            this._registrationLogState.set(typeId, {type: resourceType, tier: tier});
        }

        // New registration: commit immediately (minimal behavior)
        if (!alreadyHas) {
            this.staticResourceTypeIDs.set(typeId, {type: resourceType, tier: tier});
            this._registrationLogState.set(typeId, {type: resourceType, tier: tier});
            console.log(`[DEBUG registerStaticResourceTypeID] ✅ REGISTERED TypeID ${typeId} as ${resourceType} T${tier}`);

            if (this.settings.logLivingResources) {
                if (this.settings.logLivingHuman) {
                    console.log(`[DEBUG registerStaticResourceTypeID] (cross-ref) TypeID ${typeId} registered as ${resourceType} T${tier}`);
                } else {
                    this.structuredLog('CROSS_REFERENCE_REGISTERED', {
                        typeId: typeId,
                        staticType: resourceType,
                        staticTier: tier
                    });
                }
            }
        } else {
            // Not registered because already existed with same values — suppressed to reduce noise
            return;
        }
    }

    // Convert HarvestablesHandler type number to resource type
    getResourceTypeFromNumber(typeNumber) {
        if (typeof typeNumber !== 'number') return null;
        if (typeNumber >= 0 && typeNumber <= 5) return 'Wood';
        else if (typeNumber >= 6 && typeNumber <= 10) return 'Rock';
        else if (typeNumber >= 11 && typeNumber <= 15) return 'Fiber';
        else if (typeNumber >= 16 && typeNumber <= 22) return 'Hide';
        else if (typeNumber >= 23 && typeNumber <= 27) return 'Ore';
        return null;
    }

    updateMobInfo(newData) {
        // replace mobinfo map atomically
        try { this.mobinfo = Object.assign({}, newData); } catch (e) { this.mobinfo = {}; }
    }

    NewMobEvent(parameters) {
        // Minimal parser: index conventions may vary, keep safe with defaults
        const id = this.normalizeNumber(parameters[0], 0);
        const typeId = this.normalizeNumber(parameters[1], 0);
        const loc = parameters[7] || [0, 0];
        const posX = this.normalizeNumber(loc[0], 0);
        const posY = this.normalizeNumber(loc[1], 0);
        const health = this.normalizeNumber(parameters[2], 0) || this.normalizeNumber(parameters[13], 0) || 0;
        const enchant = this.normalizeNumber(parameters[33], 0) || 0;
        const rarity = this.normalizeNumber(parameters[19], null);

        let name = null;
        try { name = parameters[32] || parameters[31] || null; } catch (e) { name = null; }

        if (name) {
            this.AddMist(id, posX, posY, name, enchant);
        } else {
            this.AddEnemy(id, typeId, posX, posY, health, enchant, rarity, parameters);
        }
    }

    AddEnemy(id, typeId, posX, posY, health, enchant, rarity, parameters) {
        // Simple, robust addition: avoid duplicates
        if (this.mobsList.some(m => m.id === id)) return;
        if (this.harvestablesNotGood.some(m => m.id === id)) return;

        const mob = new Mob(id, typeId, posX, posY, health, enchant, rarity);
        const normHealth = Number(health) || 0;

        // 1️⃣ Try to get known info from mobinfo database (Priority 1)
        const knownInfo = this.mobinfo[typeId];
        let hasKnownInfo = false;
        if (Array.isArray(knownInfo)) {
            mob.tier = knownInfo[0] || 0;
            mob.type = knownInfo[1] || EnemyType.Enemy;
            mob.name = knownInfo[2] || null;
            hasKnownInfo = true;
        }

        // 2️⃣ Get cross-referenced static resource info (Priority 2)
        const staticInfo = this.staticResourceTypeIDs.get(typeId);

        // 3️⃣ CONSOLIDATED CLASSIFICATION: Use all sources (mobinfo > staticInfo > heuristics)

        // Known living resource from mobinfo (highest priority)
        if (hasKnownInfo && (knownInfo[1] === EnemyType.LivingHarvestable || knownInfo[1] === EnemyType.LivingSkinnable)) {
            mob.type = knownInfo[1];
        }
        // Cross-referenced resource + has health = living resource (Priority 2)
        else if (staticInfo && normHealth > 0) {
            mob.type = EnemyType.LivingHarvestable;

            // Consolidate tier: use static tier if mobinfo didn't provide one
            if (!mob.tier || mob.tier === 0) {
                mob.tier = staticInfo.tier;
            }

            // Use static resource type as name if no name from mobinfo
            if (!mob.name) {
                mob.name = staticInfo.type; // "Fiber", "Hide", "Wood", "Ore", "Rock"
            }
        }
        // Heuristic fallback: unknown creature with living resource health profile (Priority 3)
        else if (!hasKnownInfo && typeId < 600 && normHealth > 20 && normHealth < 2000) {
            mob.type = EnemyType.LivingHarvestable;
        }

        this.mobsList.push(mob);

        // 4️⃣ Structured logging with consolidated info
        if (this.settings && this.settings.logLivingResources) {
            const classification = (mob.type === EnemyType.LivingHarvestable) ? 'LIVING_RESOURCE' :
                                  (mob.type === EnemyType.LivingSkinnable) ? 'LIVING_SKINNABLE' :
                                  'ENEMY';

            let emoji = '⚔️';
            if (mob.type === EnemyType.LivingHarvestable) emoji = '🌿';
            else if (mob.type === EnemyType.LivingSkinnable) emoji = '🐾';

            // Determine how we resolved this creature
            let resolvedBy = 'heuristics';
            if (hasKnownInfo) resolvedBy = 'mobinfo';
            else if (staticInfo) resolvedBy = 'cross-reference';

            const payload = {
                entityId: mob.id,
                reportedTypeId: mob.typeId,
                resolvedTypeId: mob.typeId,
                resolvedBy: resolvedBy,
                classification: classification,
                knownInfo: knownInfo || null,
                staticInfo: staticInfo || null,
                health: normHealth,
                enchant: mob.enchantmentLevel,
                rarity: mob.rarity,
                tier: mob.tier,
                name: mob.name,
                posX: mob.posX,
                posY: mob.posY,
                emoji: emoji
            };
            this.structuredLog('SPAWN', payload);
        }
    }

    removeMob(id) {
        const before = this.mobsList.length;
        this.mobsList = this.mobsList.filter(m => m.id !== id);
        if (this.mobsList.length < before) {
            console.log(`[DEBUG removeMob] Removed EntityID=${id}`);
        }
        // also clean harvestablesNotGood
        this.harvestablesNotGood = this.harvestablesNotGood.filter(x => x.id !== id);
    }

    updateMobPosition(id, posX, posY) {
        const m = this.mobsList.find(x => x.id === id);
        if (m) { m.posX = posX; m.posY = posY; }
    }

    updateEnchantEvent(parameters) {
        const mobId = parameters[0];
        const enchantmentLevel = parameters[1];
        const found = this.mobsList.find(m => m.id == mobId) || this.harvestablesNotGood.find(m => m.id == mobId);
        if (found) { found.enchantmentLevel = enchantmentLevel; }
    }

    getMobList() {
        return [...this.mobsList];
    }

    AddMist(id, posX, posY, name, enchant) {
        if (this.mistList.some(m => m.id === id)) return;
        const m = new Mist(id, posX, posY, name, enchant);
        this.mistList.push(m);
    }

    removeMist(id) {
        this.mistList = this.mistList.filter(m => m.id !== id);
    }

    updateMistPosition(id, posX, posY) {
        const mist = this.mistList.find(m => m.id === id);
        if (!mist) return; mist.posX = posX; mist.posY = posY;
    }

    updateMistEnchantmentLevel(id, enchantmentLevel) {
        const mist = this.mistList.find(m => m.id === id);
        if (!mist) return; mist.enchant = enchantmentLevel;
    }

    Clear() {
        this.mobsList = []; this.mistList = []; this.harvestablesNotGood = [];
    }

    // Additional helpers
    updateMobInfoEntry(typeId, entry) {
        this.mobinfo[typeId] = entry;
    }

    getMobInfo(typeId) {
        return this.mobinfo[typeId] || null;
    }
}

// Exports for Node.js testing (safe for browser when module is undefined)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobsHandler;
}
