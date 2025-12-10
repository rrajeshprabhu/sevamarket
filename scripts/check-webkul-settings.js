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

const WEBKUL_API_TOKEN = envVars.WEBKUL_API_TOKEN || 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';

// Get sellers list to verify settings
async function getSellers() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: '/api/v2/seller',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${WEBKUL_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ raw: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Verifying Webkul Settings for Seva Sethu                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        console.log('Fetching seller data to verify setup...\n');
        const sellers = await getSellers();

        if (sellers.data && sellers.data.sellerList) {
            const sellerList = sellers.data.sellerList;
            console.log(`Total Sellers: ${sellerList.length}\n`);

            console.log('Seller Status Summary:');
            console.log('─────────────────────────');

            let approved = 0;
            let pending = 0;
            let rejected = 0;

            sellerList.forEach(seller => {
                if (seller.sellerStatus === 'approved') approved++;
                else if (seller.sellerStatus === 'pending') pending++;
                else if (seller.sellerStatus === 'rejected') rejected++;
            });

            console.log(`  ✓ Approved: ${approved}`);
            console.log(`  ⏳ Pending: ${pending}`);
            console.log(`  ✗ Rejected: ${rejected}`);

            console.log('\n\nSeller Details:');
            console.log('─────────────────────────');
            sellerList.forEach(seller => {
                const status = seller.sellerStatus === 'approved' ? '✓' :
                              seller.sellerStatus === 'pending' ? '⏳' : '✗';
                console.log(`  ${status} ${seller.sellerName || seller.sellerShopName}`);
                console.log(`      Email: ${seller.sellerEmail}`);
                console.log(`      Shop: ${seller.sellerShopName}`);
                console.log(`      Status: ${seller.sellerStatus}`);
                console.log('');
            });
        } else {
            console.log('Response:', JSON.stringify(sellers, null, 2));
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('SETTINGS CONFIGURED (Manual verification):');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('  ✓ Auto Approve Sellers: NO (manual approval required)');
        console.log('  ✓ Auto Approve Products: YES (products auto-approved)');
        console.log('  ✓ Commission Rate: 4%');
        console.log('  ✓ reCaptcha: Configured');
        console.log('═══════════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
