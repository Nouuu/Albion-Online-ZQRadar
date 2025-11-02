#!/usr/bin/env node
/**
 * optimize-images.js
 * Lossless PNG compression for DIST folder only (keeps source originals)
 * Uses sharp for fast and stable optimization
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const DIST_IMAGES_DIR = path.join(__dirname, '../dist/images');

console.log('\n🖼️  Image Optimization - Lossless Compression\n');

// Check if dist/images exists
if (!fs.existsSync(DIST_IMAGES_DIR)) {
    console.log('⚠️  dist/images/ not found!');
    console.log('   Run build first to copy images to dist/\n');
    process.exit(0);
}

// Check if sharp is installed
async function checkDependencies() {
    try {
        require.resolve('sharp');
        return true;
    } catch (err) {
        console.log('📦 Installing sharp (fast PNG optimizer)...\n');
        try {
            await execAsync('npm install --save-dev sharp');
            console.log('✓ Sharp installed\n');
            return true;
        } catch (installErr) {
            console.error('✗ Failed to install sharp:', installErr.message);
            return false;
        }
    }
}

// Get all PNG files recursively
function getAllPngFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllPngFiles(filePath, fileList);
        } else if (file.endsWith('.png')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Calculate total size
function calculateTotalSize(files) {
    return files.reduce((total, file) => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            return total + stats.size;
        }
        return total;
    }, 0);
}

async function optimizeImages() {
    if (!await checkDependencies()) {
        process.exit(1);
    }

    const sharp = require('sharp');

    console.log('📊 Analyzing images in dist/...\n');

    const pngFiles = getAllPngFiles(DIST_IMAGES_DIR);
    const originalSize = calculateTotalSize(pngFiles);
    const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2);

    console.log(`Found ${pngFiles.length} PNG files in dist/images/`);
    console.log(`Original total size: ${originalSizeMB} MB\n`);

    if (pngFiles.length === 0) {
        console.log('No PNG files found to optimize.');
        return;
    }

    console.log('🔧 Optimizing images (near-lossless compression with sharp)...\n');
    console.log('   Quality: 95% (imperceptible loss, excellent compression)');
    console.log('   Speed: Fast and stable');
    console.log('   Source originals: PRESERVED (images/ folder untouched)');
    console.log('   Optimizing: dist/images/ only\n');

    let processedCount = 0;
    let errorCount = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    const startTime = Date.now();

    // Process files with parallel batches for speed
    const batchSize = 50; // Process 50 files at a time

    for (let i = 0; i < pngFiles.length; i += batchSize) {
        const batch = pngFiles.slice(i, Math.min(i + batchSize, pngFiles.length));

        await Promise.all(batch.map(async (file) => {
            try {
                // Get original size
                const originalStats = fs.statSync(file);
                const originalSize = originalStats.size;

                // Read original file and optimize with quality setting
                const buffer = await sharp(file)
                    .png({
                        quality: 95,          // 95% quality (near-lossless, much better compression)
                        compressionLevel: 9,  // Maximum compression
                        adaptiveFiltering: true,
                        force: true
                    })
                    .toBuffer();

                const optimizedSize = buffer.length;
                const ratio = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
                const fileName = path.relative(DIST_IMAGES_DIR, file);

                // Write optimized file
                fs.writeFileSync(file, buffer);

                // Update totals
                totalOriginalSize += originalSize;
                totalOptimizedSize += optimizedSize;
                processedCount++;

                // Show individual file result (only every 500th file)
                if (processedCount % 500 === 0) {
                    const sizeKB = (originalSize / 1024).toFixed(1);
                    const newSizeKB = (optimizedSize / 1024).toFixed(1);
                    console.log(`    📄 Sample: ${fileName} → ${sizeKB}KB to ${newSizeKB}KB (-${ratio}%)`);
                }
            } catch (err) {
                console.error(`  ✗ Error: ${path.relative(DIST_IMAGES_DIR, file)}: ${err.message}`);
                errorCount++;
            }
        }));

        // Show progress summary (every batch of 50 files)
        const percent = ((i + batch.length) / pngFiles.length * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const filesPerSec = (processedCount / elapsed).toFixed(1);
        const eta = ((pngFiles.length - processedCount) / filesPerSec).toFixed(0);
        const avgRatio = totalOriginalSize > 0 ? ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1) : 0;

        // Only show every 5 batches (250 files)
        if ((i / batchSize) % 5 === 0 || i + batchSize >= pngFiles.length) {
            console.log(`  📊 ${processedCount}/${pngFiles.length} (${percent}%) | Avg compression: ${avgRatio}% | Speed: ${filesPerSec} files/s | ETA: ${eta}s`);
        }
    }

    const optimizedSize = calculateTotalSize(pngFiles);
    const optimizedSizeMB = (optimizedSize / (1024 * 1024)).toFixed(2);
    const savedSize = originalSize - optimizedSize;
    const savedSizeMB = (savedSize / (1024 * 1024)).toFixed(2);
    const percentSaved = ((savedSize / originalSize) * 100).toFixed(1);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);

    console.log('\n✅ Optimization completed!\n');
    console.log(`Files processed: ${processedCount}/${pngFiles.length}`);
    if (errorCount > 0) console.log(`Errors: ${errorCount}`);
    console.log(`Time taken: ${totalTime}s`);
    console.log(`Original size:  ${originalSizeMB} MB (dist/images/)`);
    console.log(`Optimized size: ${optimizedSizeMB} MB`);
    console.log(`Saved:          ${savedSizeMB} MB (${percentSaved}%)`);
    console.log('\n📝 Note: Source images/ folder unchanged (originals preserved)');
    console.log(`💡 Archives will be ~${percentSaved}% smaller\n`);
}

optimizeImages().catch(err => {
    console.error('✗ Optimization failed:', err);
    process.exit(1);
});

