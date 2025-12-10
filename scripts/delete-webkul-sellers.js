const https = require('https');
const fs = require('fs');
const path = require('path');

const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const BACKUP_DIR = path.join(__dirname, '..', 'backup');

function makeWebkulRequest(reqPath, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: reqPath,
            method: method,
            headers: {
                'Authorization': `Bearer ${WEBKUL_ACCESS_TOKEN}`,
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
    console.log('║  DELETE WEBKUL SELLERS & PRODUCTS                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        // ============================================
        // STEP 1: GET ALL SELLERS
        // ============================================
        console.log('STEP 1: Fetching all Webkul sellers...');
        console.log('─────────────────────────────────────────');

        const sellersResult = await makeWebkulRequest('/api/v2/sellers');
        console.log('API Response:', JSON.stringify(sellersResult, null, 2).substring(0, 500));

        if (sellersResult.data && sellersResult.data.data && sellersResult.data.data.sellerList) {
            const sellers = sellersResult.data.data.sellerList;
            console.log(`\nFound ${sellers.length} sellers\n`);

            // Backup sellers
            const sellerBackupFile = path.join(BACKUP_DIR, `webkul-sellers-${timestamp}.json`);
            fs.writeFileSync(sellerBackupFile, JSON.stringify(sellers, null, 2));
            console.log(`  ✓ Backed up sellers to ${sellerBackupFile}\n`);

            // List sellers
            console.log('Sellers found:');
            sellers.forEach(s => {
                console.log(`  • ${s.sellerShopName || s.sellerName} (ID: ${s.sellerId})`);
            });

            console.log('\n─────────────────────────────────────────');
            console.log('NOTE: Webkul API may not support DELETE for sellers.');
            console.log('You may need to delete sellers manually from:');
            console.log('  Webkul Admin → Sellers → Seller Listing → Delete');
            console.log('─────────────────────────────────────────\n');

            // Try to delete each seller
            console.log('Attempting to delete sellers via API...\n');
            for (const seller of sellers) {
                console.log(`  Trying to delete: ${seller.sellerShopName || seller.sellerName} (ID: ${seller.sellerId})`);

                // Try different API endpoints
                const deleteResult = await makeWebkulRequest(`/api/v2/seller/${seller.sellerId}`, 'DELETE');
                console.log(`    Response: ${deleteResult.status} - ${JSON.stringify(deleteResult.data).substring(0, 100)}`);

                await sleep(200);
            }

        } else {
            console.log('Could not fetch sellers. Response:');
            console.log(JSON.stringify(sellersResult, null, 2));

            console.log('\n─────────────────────────────────────────');
            console.log('The Webkul API may not expose seller listing.');
            console.log('Please delete sellers manually from:');
            console.log('  1. Go to: seva-dev.myshopify.com/admin/apps/multi-vendor-marketplace');
            console.log('  2. Click Sellers → Seller Listing');
            console.log('  3. Click on each seller → Delete');
            console.log('─────────────────────────────────────────\n');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
