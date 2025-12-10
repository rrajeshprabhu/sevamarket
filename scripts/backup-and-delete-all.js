const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;
const BACKUP_DIR = path.join(__dirname, '..', 'backup');

function makeRequest(reqPath, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: reqPath,
            method: method,
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  BACKUP & DELETE ALL DATA - Seva Sethu Clean Slate         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        // ============================================
        // STEP 1: BACKUP PRODUCTS
        // ============================================
        console.log('STEP 1: Backing up products...');
        console.log('─────────────────────────────────────────');

        const productsResult = await makeRequest('/admin/api/2024-01/products.json?limit=250');
        const products = productsResult.data.products || [];

        const productBackupFile = path.join(BACKUP_DIR, `products-${timestamp}.json`);
        fs.writeFileSync(productBackupFile, JSON.stringify(products, null, 2));
        console.log(`  ✓ Backed up ${products.length} products to ${productBackupFile}\n`);

        // ============================================
        // STEP 2: BACKUP CUSTOM COLLECTIONS
        // ============================================
        console.log('STEP 2: Backing up custom collections...');
        console.log('─────────────────────────────────────────');

        const customCollResult = await makeRequest('/admin/api/2024-01/custom_collections.json?limit=250');
        const customCollections = customCollResult.data.custom_collections || [];

        const customCollBackupFile = path.join(BACKUP_DIR, `custom-collections-${timestamp}.json`);
        fs.writeFileSync(customCollBackupFile, JSON.stringify(customCollections, null, 2));
        console.log(`  ✓ Backed up ${customCollections.length} custom collections\n`);

        // ============================================
        // STEP 3: BACKUP SMART COLLECTIONS
        // ============================================
        console.log('STEP 3: Backing up smart collections...');
        console.log('─────────────────────────────────────────');

        const smartCollResult = await makeRequest('/admin/api/2024-01/smart_collections.json?limit=250');
        const smartCollections = smartCollResult.data.smart_collections || [];

        const smartCollBackupFile = path.join(BACKUP_DIR, `smart-collections-${timestamp}.json`);
        fs.writeFileSync(smartCollBackupFile, JSON.stringify(smartCollections, null, 2));
        console.log(`  ✓ Backed up ${smartCollections.length} smart collections\n`);

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('BACKUP COMPLETE! Now deleting...');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // ============================================
        // STEP 4: DELETE ALL PRODUCTS
        // ============================================
        console.log('STEP 4: Deleting all products...');
        console.log('─────────────────────────────────────────');

        let deletedProducts = 0;
        for (const product of products) {
            const deleteResult = await makeRequest(`/admin/api/2024-01/products/${product.id}.json`, 'DELETE');
            if (deleteResult.status === 200 || deleteResult.status === 204) {
                deletedProducts++;
                process.stdout.write(`  Deleted ${deletedProducts}/${products.length} products\r`);
            } else {
                console.log(`  ✗ Failed to delete product ${product.id}: ${deleteResult.status}`);
            }
            await sleep(100); // Rate limiting
        }
        console.log(`\n  ✓ Deleted ${deletedProducts} products\n`);

        // ============================================
        // STEP 5: DELETE SMART COLLECTIONS
        // ============================================
        console.log('STEP 5: Deleting smart collections...');
        console.log('─────────────────────────────────────────');

        let deletedSmartColl = 0;
        for (const coll of smartCollections) {
            const deleteResult = await makeRequest(`/admin/api/2024-01/smart_collections/${coll.id}.json`, 'DELETE');
            if (deleteResult.status === 200 || deleteResult.status === 204) {
                deletedSmartColl++;
                process.stdout.write(`  Deleted ${deletedSmartColl}/${smartCollections.length} smart collections\r`);
            } else {
                console.log(`  ✗ Failed to delete smart collection ${coll.id}: ${deleteResult.status}`);
            }
            await sleep(100);
        }
        console.log(`\n  ✓ Deleted ${deletedSmartColl} smart collections\n`);

        // ============================================
        // STEP 6: DELETE CUSTOM COLLECTIONS (except "Home page")
        // ============================================
        console.log('STEP 6: Deleting custom collections...');
        console.log('─────────────────────────────────────────');

        let deletedCustomColl = 0;
        for (const coll of customCollections) {
            // Keep "Home page" collection as it may be system required
            if (coll.title.toLowerCase() === 'home page') {
                console.log(`  ⏭ Skipping "Home page" collection (system)`);
                continue;
            }
            const deleteResult = await makeRequest(`/admin/api/2024-01/custom_collections/${coll.id}.json`, 'DELETE');
            if (deleteResult.status === 200 || deleteResult.status === 204) {
                deletedCustomColl++;
                process.stdout.write(`  Deleted ${deletedCustomColl}/${customCollections.length - 1} custom collections\r`);
            } else {
                console.log(`  ✗ Failed to delete custom collection ${coll.id}: ${deleteResult.status}`);
            }
            await sleep(100);
        }
        console.log(`\n  ✓ Deleted ${deletedCustomColl} custom collections\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('CLEAN SLATE COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`  Products deleted:          ${deletedProducts}`);
        console.log(`  Smart collections deleted: ${deletedSmartColl}`);
        console.log(`  Custom collections deleted: ${deletedCustomColl}`);
        console.log('');
        console.log('Backup files saved in /backup folder:');
        console.log(`  • ${productBackupFile}`);
        console.log(`  • ${customCollBackupFile}`);
        console.log(`  • ${smartCollBackupFile}`);
        console.log('');
        console.log('NOTE: Webkul sellers need to be deleted manually from:');
        console.log('  Webkul Admin → Sellers → Seller Listing → Delete each seller');
        console.log('═══════════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
