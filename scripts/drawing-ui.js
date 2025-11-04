// ========== Statistics Update ==========
function initStats() {
    setInterval(function () {
        if (typeof harvestablesHandler !== 'undefined') {
            const stats = harvestablesHandler.getStats();

            // Format duration
            const h = Math.floor(stats.sessionDuration / 3600);
            const m = Math.floor((stats.sessionDuration % 3600) / 60);
            const s = stats.sessionDuration % 60;
            document.getElementById('statDuration').textContent = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

            // Main counters
            document.getElementById('statDetected').textContent = stats.totalDetected;
            document.getElementById('statHarvested').textContent = stats.totalHarvested;

            // By type (detected only for compact view)
            document.getElementById('statFiber').textContent = stats.byType.Fiber.detected;
            document.getElementById('statHide').textContent = stats.byType.Hide.detected;
            document.getElementById('statWood').textContent = stats.byType.Log.detected;
            document.getElementById('statOre').textContent = stats.byType.Ore.detected;
            document.getElementById('statRock').textContent = stats.byType.Rock.detected;

            // By tier (T4-T8 only for compact view)
            document.getElementById('statT4').textContent = stats.byTier[4].detected;
            document.getElementById('statT5').textContent = stats.byTier[5].detected;
            document.getElementById('statT6').textContent = stats.byTier[6].detected;
            document.getElementById('statT7').textContent = stats.byTier[7].detected;
            document.getElementById('statT8').textContent = stats.byTier[8].detected;

            // Enchantments (harvested resources)
            document.getElementById('statEnchant0').textContent = stats.byEnchantment.harvested[0] || 0;
            document.getElementById('statEnchant1').textContent = stats.byEnchantment.harvested[1] || 0;
            document.getElementById('statEnchant2').textContent = stats.byEnchantment.harvested[2] || 0;
            document.getElementById('statEnchant3').textContent = stats.byEnchantment.harvested[3] || 0;
            document.getElementById('statEnchant4').textContent = stats.byEnchantment.harvested[4] || 0;
        }
    }, 1000);
}

// ========== Overlay Window ==========
function openOverlayWindow() {
    const features = [
        'width=520',
        'height=520',
        'resizable=no',
        'toolbar=no',
        'menubar=no',
        'location=no',
        'status=no',
        'scrollbars=no',
        'titlebar=no',
        'directories=no',
        'personalbar=no',
        'chrome=no'
    ].join(',');

    window.open('/radar-overlay', 'RadarOverlay', features);
}

// ========== Overlay Controls ==========
function initOverlayControls() {
    // Helper functions
    const getBool = (key, defaultVal = true) => {
        const val = localStorage.getItem(key);
        return val === null ? defaultVal : val === 'true';
    };
    const setBool = (key, val) => localStorage.setItem(key, val);
    const getNumber = (key, defaultVal) => parseInt(localStorage.getItem(key)) || defaultVal;

    // Get checkbox elements
    const enchantmentCheckbox = document.getElementById('overlayEnchantment');
    const resourceCountCheckbox = document.getElementById('overlayResourceCount');
    const distanceCheckbox = document.getElementById('overlayDistance');
    const clusterCheckbox = document.getElementById('overlayCluster');
    const clusterRadiusInput = document.getElementById('overlayClusterRadius');
    const clusterMinSizeInput = document.getElementById('overlayClusterMinSize');

    // Load initial values (defaults: enchantment=true, count=true, distance=false, cluster=false)
    enchantmentCheckbox.checked = getBool('settingResourceEnchantOverlay', true);
    resourceCountCheckbox.checked = getBool('settingResourceCount', true);
    distanceCheckbox.checked = getBool('settingResourceDistance', false);
    clusterCheckbox.checked = getBool('settingResourceClusters', false);
    clusterRadiusInput.value = getNumber('settingClusterRadius', 30);
    clusterMinSizeInput.value = getNumber('settingClusterMinSize', 2);

    // Update settings object in real-time when checkboxes change
    const updateSettings = () => {
        if (typeof settings !== 'undefined') {
            settings.overlayEnchantment = enchantmentCheckbox.checked;
            settings.overlayResourceCount = resourceCountCheckbox.checked;
            settings.overlayDistance = distanceCheckbox.checked;
            settings.overlayCluster = clusterCheckbox.checked;
            settings.overlayClusterRadius = parseInt(clusterRadiusInput.value);
            settings.overlayClusterMinSize = parseInt(clusterMinSizeInput.value);
            settings.update(); // Reload settings from localStorage
        }
    };

    // Add event listeners - save to localStorage and update settings
    enchantmentCheckbox.addEventListener('change', (e) => {
        setBool('settingResourceEnchantOverlay', e.target.checked);
        updateSettings();
    });

    resourceCountCheckbox.addEventListener('change', (e) => {
        setBool('settingResourceCount', e.target.checked);
        updateSettings();
    });

    distanceCheckbox.addEventListener('change', (e) => {
        setBool('settingResourceDistance', e.target.checked);
        updateSettings();
    });

    clusterCheckbox.addEventListener('change', (e) => {
        setBool('settingResourceClusters', e.target.checked);
        updateSettings();
    });

    clusterRadiusInput.addEventListener('input', (e) => {
        localStorage.setItem('settingClusterRadius', e.target.value);
        updateSettings();
    });

    clusterMinSizeInput.addEventListener('input', (e) => {
        localStorage.setItem('settingClusterMinSize', e.target.value);
        updateSettings();
    });
}

// ========== Initialize on page load ==========
document.addEventListener('DOMContentLoaded', function () {
    // Initialize stats update interval
    initStats();

    // Initialize overlay controls
    initOverlayControls();

    // Setup overlay window button
    const openOverlayBtn = document.getElementById('openOverlay');
    if (openOverlayBtn) {
        openOverlayBtn.addEventListener('click', openOverlayWindow);
    }
});