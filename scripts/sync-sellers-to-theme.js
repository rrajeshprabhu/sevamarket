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
const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';

function webkulRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + WEBKUL_ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'shop': SHOP
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
        req.end();
    });
}

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01' + endpoint,
            method: method,
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
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
        if (postData) req.write(postData);
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Syncing Sellers from Webkul to Theme                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Get sellers from Webkul API
    console.log('Step 1: Fetching sellers from Webkul...');
    const sellersResult = await webkulRequest('/api/v2/sellers.json');

    if (sellersResult.status !== 200) {
        console.log('Failed to fetch sellers:', sellersResult);
        return;
    }

    const sellers = sellersResult.data.sellers || [];
    console.log('Found ' + sellers.length + ' sellers\n');

    // Step 2: Build the Liquid variables
    const ids = [];
    const names = [];
    const handles = [];
    const logos = [];

    for (const seller of sellers) {
        ids.push(seller.id);
        names.push(seller.sp_store_name || seller.store_name || 'Unknown');
        handles.push((seller.sp_store_name || 'seller').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        logos.push(seller.shop_logo || 'https://sp-seller.webkul.com/img/seller_shop_logo/shop-logo.png');

        console.log('  - ' + seller.sp_store_name + ' (ID: ' + seller.id + ')');
    }

    // Step 3: Generate the Liquid snippet
    const liquidContent = `{% assign url_type = '?' %}
{% assign wk_store_ids = "${ids.join(',')}" | split: ',' %}
{% assign wk_store_names = "${names.join(',')}" | split: ',' %}
{% assign wk_store_handles = "${handles.join(',')}" | split: ',' %}
{% assign wk_store_logos = "${logos.join(',')}" | split: ',' %}
`;

    console.log('\nStep 2: Generated Liquid snippet');
    console.log('─────────────────────────────────');
    console.log(liquidContent);

    // Step 4: Save locally
    const localPath = path.join(__dirname, '..', 'theme', 'snippets', 'wk-seller-listing-variable.liquid');
    fs.writeFileSync(localPath, liquidContent);
    console.log('Step 3: Saved to local file\n');

    // Step 5: Upload to Shopify theme
    console.log('Step 4: Uploading to Shopify theme...');

    // Get theme ID
    const themesResult = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themesResult.data.themes.find(t => t.role === 'main');

    if (!mainTheme) {
        console.log('Could not find main theme');
        return;
    }

    const uploadResult = await shopifyRequest('PUT', '/themes/' + mainTheme.id + '/assets.json', {
        asset: {
            key: 'snippets/wk-seller-listing-variable.liquid',
            value: liquidContent
        }
    });

    if (uploadResult.status === 200) {
        console.log('✓ Uploaded successfully!\n');
    } else {
        console.log('✗ Upload failed:', uploadResult.status);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  SYNC COMPLETE!                                             ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Sellers synced: ' + sellers.length + '                                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nBrowse page will now show updated sellers:');
    console.log('  https://seva-sethu.com/pages/browse');
}

main().catch(console.error);
