const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01${endpoint}`,
            method: method,
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
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

async function main() {
    console.log('=== Setting Correct Menu in Theme ===\n');

    // Get theme
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (!mainTheme) {
        console.log('No main theme found!');
        return;
    }

    console.log('Main theme:', mainTheme.name, '(ID:', mainTheme.id + ')');

    // Get current header-group.json
    const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

    if (headerGroupAsset.data?.asset?.value) {
        const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);
        console.log('Current menu setting:', headerGroup.sections?.header?.settings?.menu);

        // Set to use main-menu-2 which has our categories
        headerGroup.sections.header.settings.menu = 'main-menu-2';

        const updateResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
            asset: {
                key: 'sections/header-group.json',
                value: JSON.stringify(headerGroup, null, 2)
            }
        });

        if (updateResult.status === 200) {
            console.log('✓ Theme updated to use main-menu-2 with categories!');
        } else {
            console.log('Update failed:', updateResult.status);
        }
    }

    console.log('\nDone! Refresh browser to see new navigation.');
}

main().catch(console.error);
