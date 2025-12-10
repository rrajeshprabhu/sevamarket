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

// Get shop payment settings
async function getShopInfo() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/shop.json',
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.end();
    });
}

// Get payment gateways
async function getPaymentGateways() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/payment_gateways.json',
            method: 'GET',
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
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ error: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Checking Payment Settings for Seva Sethu                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        const shopInfo = await getShopInfo();
        console.log('Shop Info:');
        console.log(`  Name: ${shopInfo.shop.name}`);
        console.log(`  Currency: ${shopInfo.shop.currency}`);
        console.log(`  Money Format: ${shopInfo.shop.money_format}`);
        console.log(`  Checkout API Supported: ${shopInfo.shop.checkout_api_supported}`);

        console.log('\n--- Payment Gateways ---\n');
        const gateways = await getPaymentGateways();

        if (gateways.payment_gateways) {
            gateways.payment_gateways.forEach(gw => {
                console.log(`  ${gw.name}`);
                console.log(`    - Type: ${gw.type}`);
                console.log(`    - Enabled: ${gw.enabled_card_brands ? 'Yes' : 'Check admin'}`);
                if (gw.enabled_card_brands) {
                    console.log(`    - Cards: ${gw.enabled_card_brands.join(', ')}`);
                }
                console.log('');
            });
        } else {
            console.log('  Could not fetch payment gateways (may need additional permissions)');
            console.log('  Response:', JSON.stringify(gateways, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
