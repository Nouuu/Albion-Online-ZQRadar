# 👥 Player Detection & Display System

*Last updated: 2025-11-09*



## 🔴 CRITICAL ISSUE - PLAYERS NOT DISPLAYING

> !!! Check on :
> - https://github.com/rafalfigura/AO-Radar
> - https://github.com/Revalto/ao-network
> - https://github.com/DocTi/albion-network
> - https://github.com/kolloko2/AlbionOnlinePhotonEventIds

**Status**: ❌ **OTHER PLAYERS DO NOT APPEAR ON RADAR**

### Known Issues:
- ✅ Player **detection** works (NewCharacter events captured)
- ✅ Local player position (lpX/lpY) works
- ❌ **Other players DON'T display** - positions are corrupted in Move events
- ❌ Buffer decoding at offsets 12-19 works for **MOBS only**, not players
- ❌ param[4]/[5] in Move events contain corrupted values for players (2.733e-9, etc.)

**See**: `docs/work/PLAYERS_VS_MOBS_PROTOCOL_DIFFERENCES.md` for detailed analysis

---

## 📋 Table of Contents

- [Critical Issue](#-critical-issue---players-not-displaying)
- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Implementation Status](#implementation-status)
- [Usage](#usage)
- [Debug & Logging](#debug--logging)
- [Future Improvements](#future-improvements)

---

## Overview

The player detection system **attempts to** track and display enemy players on the radar in real-time. Players are detected through network packet analysis but **currently do not display correctly** due to protocol differences between mobs and players.

### Current Features ✅

- **Player Detection**: NewCharacter events captured successfully
- **Type Filtering**: Separate toggles for Passive/Faction/Dangerous players
- **Debug Logging**: Detailed logs for detection events
- **Master Toggle**: `settingShowPlayers` to enable/disable all player detection

### NOT Working ❌

- **Radar Display**: Players do NOT appear on radar (corrupted positions)
- **Position Updates**: Move events contain corrupted coordinates for players
- **Smooth Movement**: N/A - positions never update correctly

### Planned Features 🚧

- Nickname display on hover
- Health bar overlay
- Distance indicator
- Guild/Alliance tags
- Color-coded dots by faction status
- Mount status indicator

---

## Architecture

### File Structure

```
scripts/
├── Handlers/
│   └── PlayersHandler.js       # Detection, filtering, storage
├── Drawings/
│   └── PlayersDrawing.js       # Rendering on radar canvas
└── Utils/
    ├── Settings.js             # Settings management
    └── ItemsPage.js            # Items display (requires settingShowPlayers)

views/main/
└── home.ejs                    # UI controls for player settings
```

### Data Flow

```
Network Packet (Photon)
    ↓
PlayersHandler.handleNewPlayerEvent(parameters)
    ├─ Check: settings.settingShowPlayers enabled?
    ├─ Check: Player type filter enabled? (Passive/Faction/Dangerous)
    ├─ Check: Ignore list (players/guilds/alliances)
    └─ Add to playersInRange[] array
    ↓
Render Loop (scripts/Utils/Utils.js)
    ├─ PlayersDrawing.interpolate(players, lpX, lpY, t)
    │   └─ Calculate smooth positions (hX, hY) using lerp
    └─ PlayersDrawing.invalidate(context, players)
        └─ Draw red circles for each player
```

---

## Configuration

### Required Settings

1. **`settingShowPlayers`** (Master Toggle) ⭐
   - Location: `views/main/home.ejs` - Show section
   - Default: `false`
   - **Must be enabled** for any player detection

2. **At least ONE type filter:**
   - `settingPassivePlayers` - Non-flagged players (flagId = 0)
   - `settingFactionPlayers` - Faction warfare players (flagId = 1-6)
   - `settingDangerousPlayers` - Hostile players (flagId = 255 or Black Zone)

### Optional Settings

| Setting | Description | Location | Default |
|---------|-------------|----------|---------|
| `settingItems` | Show player equipment | home.ejs | `false` |
| `settingItemsDev` | Show item IDs (dev) | home.ejs | `false` |
| `settingSound` | Play sound on detection | home.ejs | `false` |
| `settingFlash` | Red flash on detection | home.ejs | `false` |
| `settingNickname` | Show nickname* | - | `false` |
| `settingHealth` | Show health bar* | - | `false` |
| `settingDistance` | Show distance* | - | `false` |
| `settingGuild` | Show guild name* | - | `false` |
| `settingMounted` | Show mount status* | - | `false` |

*Not yet implemented in UI or drawing logic*

### Ignore Lists

Players can be filtered out by:
- **Player nickname** (exact match, case-insensitive)
- **Guild name** (exact match, case-insensitive)
- **Alliance name** (exact match, case-insensitive)

Managed in `views/main/ignorelist.ejs`

---

## Implementation Status

### ✅ Completed (2025-11-07)

#### 1. Core Drawing System
- **File**: `scripts/Drawings/PlayersDrawing.js`
- **Changes**:
  - Uncommented `interpolate()` method (lines 94-109)
  - Uncommented & refactored `invalidate()` method (lines 112-162)
  - Added CATEGORIES/EVENTS constants for logging
  - Implemented red dot drawing (`#FF0000`, 10px radius)
  - **NEW**: Added persistent player tracking with `Set` (prevents duplicate logs)
  - **NEW**: Added 50-player display limit to prevent performance issues in cities
  - **NEW**: Optimized logging (only log count changes, not every frame)

#### 2. Handler Logic
- **File**: `scripts/Handlers/PlayersHandler.js`
- **Status**: Fully functional
- **Features**:
  - Detects new players from network packets
  - Filters by type (Passive/Faction/Dangerous)
  - Manages ignore lists
  - Tracks health updates
  - Handles mount status
- **Bug Fixes (2025-11-07)**:
  - **CRITICAL**: Fixed `updatePlayerPosition()` - was empty, now updates `posX`/`posY` (lines 248-259)
  - **CRITICAL**: Enabled position updates in `Utils.js:296` (was commented out)
  - **FIX**: Added error handling for audio autoplay (`NotAllowedError`) (lines 207-214)
  - Players now appear at correct positions instead of all at (0, 0)

#### 3. Settings System
- **Files**:
  - `scripts/Utils/Settings.js`
  - `views/main/home.ejs`
- **Changes**:
  - Renamed `settingDot` → `settingShowPlayers` (consistent naming)
  - Added UI checkbox in home.ejs (line 20-32)
  - Added JavaScript handlers (lines 152-174)
  - Settings persist in localStorage

#### 4. Debug Logging
- **Category**: `CATEGORIES.PLAYER`, `CATEGORIES.PLAYER_HEALTH`
- **Events**:
  - `NewPlayerEvent_ALL_PARAMS` - Full detection details
  - `PlayerDebugInfo` - Drawing info (position, nickname, etc.)
  - `PlayerHealthUpdate_DETAIL` - Health changes
- **Toggle**: `settingDebugPlayers` in Settings page

### 🚧 Partially Implemented

#### 1. Additional Display Options
- **Status**: Settings exist but not used in drawing
- **Variables defined** (Settings.js:17-22):
  - `settingNickname` - Defined but not rendered
  - `settingHealth` - Defined but not rendered
  - `settingDistance` - Defined but not rendered
  - `settingGuild` - Defined but not rendered
  - `settingMounted` - Defined but not rendered

#### 2. Items Display
- **File**: `scripts/Drawings/PlayersDrawing.js` - `drawItems()` method
- **Status**: Implemented but separate from radar drawing
- **Usage**: Shows equipment list in side panel (not on radar)

### ❌ Not Implemented

#### 1. Advanced Radar Features
- Nickname overlay on radar
- Health bar on radar dots
- Distance indicators on radar
- Guild tag on radar
- Color-coded dots by faction
- Mount status indicator on radar

#### 2. UI for Additional Settings
No checkboxes in `home.ejs` for:
- `settingNickname`
- `settingHealth`
- `settingDistance`
- `settingGuild`
- `settingMounted`

---

## Usage

### For Users

#### Enable Player Detection

1. Launch the app: `npm start`
2. Open browser: `http://localhost:5001`
3. Navigate to **Players** page (`/home`)
4. **Show Section**:
   - ✅ Check **"Show Players on Radar"**
5. **Types Section** (check at least one):
   - Passive Players (safe zones)
   - Faction Players (faction warfare)
   - Dangerous Players (red/black flagged)
6. Launch Albion Online and play
7. Players will appear as **red dots** 🔴 on the radar

#### Optional: Enable Debug Logs

1. Go to **Settings** page (`/settings`)
2. **Debug & Logging** section
3. ✅ Check **"Debug Players"**
4. Open browser console (F12) to see logs

### For Developers

#### Reading Player Data

```javascript
// Access players in range
const players = playersHandler.playersInRange;

// Player object structure
{
  id: number,           // Unique player ID
  nickname: string,     // Player name
  guildName: string,    // Guild name
  posX: number,         // World X position
  posY: number,         // World Y position
  hX: number,           // Radar X (interpolated)
  hY: number,           // Radar Y (interpolated)
  currentHealth: number,
  initialHealth: number,
  items: Array,         // Equipment items
  flagId: number,       // Faction status (0=passive, 1-6=faction, 255=hostile)
  mounted: boolean      // Mount status
}
```

#### Extending Drawing Logic

To add new visual elements in `PlayersDrawing.invalidate()`:

```javascript
invalidate(context, players) {
  for (const playerOne of players) {
    const point = this.transformPoint(playerOne.hX, playerOne.hY);

    // Draw red dot (existing)
    this.drawFilledCircle(context, point.x, point.y, 10, '#FF0000');

    // Example: Add nickname (NEW)
    if (this.settings.settingNickname) {
      this.drawText(point.x, point.y + 20, playerOne.nickname, context);
    }

    // Example: Add health bar (NEW)
    if (this.settings.settingHealth) {
      const percent = playerOne.currentHealth / playerOne.initialHealth;
      this.drawHealthBar(context, point.x, point.y,
                        playerOne.currentHealth,
                        playerOne.initialHealth, 60, 10);
    }
  }
}
```

---

## Debug & Logging

### Enable Logging

**Via UI** (Recommended):
- Settings → Debug & Logging → ✅ Debug Players

**Via Console**:
```javascript
localStorage.setItem('settingDebugPlayers', 'true');
location.reload();
```

### Log Categories

#### `CATEGORIES.PLAYER`
- **NewPlayerEvent_ALL_PARAMS**: Full detection event
  ```javascript
  {
    playerId: 12345,
    nickname: "PlayerName",
    guildName: "GuildName",
    alliance: "AllianceName",
    health: 1000,
    flagId: 0,
    allParameters: {...},  // All 50+ parameters
    parameterCount: 54
  }
  ```

- **PlayerDebugInfo**: Drawing details
  ```javascript
  // Count log (once per frame if players exist)
  {
    playersCount: 3,
    playerIds: [12345, 67890, 11111],
    playerNicknames: ["Player1", "Player2", "Player3"]
  }

  // Per-player log (once per player)
  {
    id: 12345,
    nickname: "PlayerName",
    hX: 120.5,
    hY: -45.2,
    pointX: 250,  // Canvas X
    pointY: 250,  // Canvas Y
    flagId: 0
  }
  ```

#### `CATEGORIES.PLAYER_HEALTH`
- **PlayerHealthUpdate_DETAIL**: Health changes
  ```javascript
  {
    playerId: 12345,
    params2_currentHP: 850,
    params3_maxHP: 1000,
    hpPercentage: "85%",
    allParameters: {...},
    parameterCount: 5
  }
  ```

### Log Settings Map

From `scripts/constants/LoggerConstants.js`:

```javascript
CATEGORY_SETTINGS_MAP = {
  PLAYER: 'debugPlayers',          // Toggle in Settings
  PLAYER_HEALTH: 'debugPlayers',   // Same toggle
  // ...
}
```

---

## Future Improvements

### Priority 1: Radar Enhancements 🎯

#### 1. Nickname Display
- **Goal**: Show player nickname near radar dot
- **Files**: `PlayersDrawing.js:invalidate()`
- **UI**: Add checkbox in `home.ejs`
- **Estimate**: ~30 minutes

#### 2. Health Bar Overlay
- **Goal**: Show HP bar below player dot
- **Files**: `PlayersDrawing.js:invalidate()`
- **UI**: Add checkbox in `home.ejs`
- **Method**: Reuse `drawHealthBar()` from DrawingUtils
- **Estimate**: ~30 minutes

#### 3. Distance Indicator
- **Goal**: Show distance in meters from local player
- **Files**: `PlayersDrawing.js:invalidate()`
- **UI**: Add checkbox in `home.ejs`
- **Calculation**: Already in `MobsDrawing` pattern
- **Estimate**: ~30 minutes

### Priority 2: Visual Improvements 🎨

#### 4. Color-Coded Dots by Faction
- **Goal**: Different colors per flagId
  - Green: Passive (0)
  - Yellow/Orange: Faction (1-6)
  - Red: Hostile (255)
- **Files**: `PlayersDrawing.js:invalidate()`
- **Pattern**: Similar to `MobsDrawing.getEnemyColor()`
- **Estimate**: ~45 minutes

#### 5. Guild/Alliance Tags
- **Goal**: Show guild name or alliance tag
- **Files**: `PlayersDrawing.js:invalidate()`
- **UI**: Add checkbox in `home.ejs`
- **Estimate**: ~30 minutes

#### 6. Mount Status Indicator
- **Goal**: Visual indicator if player is mounted
- **Files**: `PlayersDrawing.js:invalidate()`
- **UI**: Checkbox already exists (`settingMounted`)
- **Design**: Circle border or icon
- **Estimate**: ~30 minutes

### Priority 3: Advanced Features 🚀

#### 7. Faction Flag Icons
- **Goal**: Show faction flag icon instead of circle
- **Files**: `PlayersDrawing.js:invalidate()`
- **Assets**: Use existing `FactionFlagInfo` + flag images
- **Pattern**: Similar to mobs using `DrawCustomImage()`
- **Estimate**: ~1 hour

#### 8. Threat Level Indicator
- **Goal**: Size/color based on gear or health
- **Files**: `PlayersHandler.js`, `PlayersDrawing.js`
- **Logic**: Analyze items array for tier/enchant
- **Estimate**: ~2 hours

#### 9. Player History/Tracking
- **Goal**: Track player movements over time
- **Files**: New file `PlayerTracker.js`
- **Features**:
  - Path visualization
  - Time in area
  - Alert on return
- **Estimate**: ~4 hours

---

## Code References

### Key Files

- **PlayersHandler.js:116** - `settingShowPlayers` check
- **PlayersDrawing.js:20** - `settingShowPlayers` check (items)
- **PlayersDrawing.js:88-103** - `interpolate()` method
- **PlayersDrawing.js:109-140** - `invalidate()` method
- **Settings.js:17** - Settings definition
- **Settings.js:393** - Settings update from localStorage
- **home.ejs:21** - UI checkbox
- **LoggerConstants.js:20** - `CATEGORIES.PLAYER`
- **LoggerConstants.js:160** - `CATEGORY_SETTINGS_MAP`

### Patterns to Follow

For consistency, follow these existing patterns:

1. **Drawing Pattern**: See `MobsDrawing.js:invalidate()`
2. **Health Bar**: See `DrawingUtils.drawHealthBar()`
3. **Color Coding**: See `MobsDrawing.getEnemyColor()`
4. **Custom Images**: See `DrawingUtils.DrawCustomImage()`
5. **Distance Calc**: See `DrawingUtils.calculateDistance()`

---

## Troubleshooting

### Players Not Showing on Radar

1. ✅ Check `settingShowPlayers` is enabled
2. ✅ Check at least one type filter is enabled
3. ✅ Check player isn't in ignore list
4. 🐛 Enable `debugPlayers` and check console logs
5. 🔍 Verify `NewPlayerEvent_ALL_PARAMS` logs appear

### Players Showing But No Visual

1. Check `playersInRange` array has data
2. Check `interpolate()` is calculating hX/hY
3. Check `invalidate()` is being called
4. Look for `PlayerDebugInfo` logs with positions

### Settings Not Saving

1. Check browser localStorage isn't disabled
2. Check for errors in browser console
3. Verify localStorage keys: `settingShowPlayers`, etc.

---

## Contributing

When adding new player features:

1. ✅ Follow existing naming patterns (`setting*`)
2. ✅ Add UI checkbox in `home.ejs`
3. ✅ Add setting to `Settings.js` (constructor + update)
4. ✅ Add debug logging with appropriate CATEGORY/EVENT
5. ✅ Update this documentation
6. ✅ Test with `debugPlayers` enabled

---

*For more information, see:*
- [LOGGING.md](./LOGGING.md) - Logging system details
- [SETTINGS.md](./SETTINGS.md) - Settings system overview
- [DEV_GUIDE.md](../dev/DEV_GUIDE.md) - Development guidelines
