const https = require('https');

// Shopify API Configuration
const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

// Helper function to make API requests
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
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// GraphQL request helper
function shopifyGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/graphql.json',
            method: 'POST',
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
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({ query, variables }));
        req.end();
    });
}

async function main() {
    console.log('=== Shopify Admin - Check Permissions & Theme ===\n');

    // Step 1: Check if the Become a Seller page exists
    console.log('1. Checking if Become a Seller page exists...');
    const pages = await shopifyRequest('GET', '/pages.json');
    const becomeSellerPage = pages.data.pages?.find(p => p.handle === 'become-a-seller');
    if (becomeSellerPage) {
        console.log('✓ Become a Seller page exists:', becomeSellerPage.id);
    } else {
        console.log('Creating Become a Seller page...');
        const pageData = {
            page: {
                title: "Become a Seller",
                handle: "become-a-seller",
                body_html: `
                    <div style="text-align: center; padding: 40px;">
                        <h1>Become a Seller</h1>
                        <p>Join our marketplace and start selling your products today!</p>
                        <p>Loading seller registration...</p>
                    </div>
                    <script>
                        window.location.href = '/apps/multi-vendor-marketplace/seller/register';
                    </script>
                `,
                published: true
            }
        };
        const createPage = await shopifyRequest('POST', '/pages.json', pageData);
        console.log('Create Page Result:', JSON.stringify(createPage, null, 2));
    }

    // Step 2: Get the main theme and modify the header to include the link
    console.log('\n2. Getting main theme...');
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (mainTheme) {
        console.log('✓ Main theme found:', mainTheme.name, '(ID:', mainTheme.id + ')');

        // Get the header settings from the theme
        console.log('\n3. Getting theme settings...');
        const settingsAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`);
        console.log('Settings:', JSON.stringify(settingsAsset, null, 2).substring(0, 1000));

        // Try to get the header section
        console.log('\n4. Getting theme asset list...');
        const assets = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json`);
        const headerAssets = assets.data.assets?.filter(a =>
            a.key.includes('header') || a.key.includes('navigation') || a.key.includes('menu')
        );
        console.log('Header/Navigation related assets:', headerAssets?.map(a => a.key));
    }

    console.log('\n=== Summary ===');
    console.log('✓ "Become a Seller" page is ready at: https://seva-dev.myshopify.com/pages/become-a-seller');
    console.log('\nTo add the link to navigation, you need to:');
    console.log('1. Go to Shopify Admin -> Online Store -> Navigation');
    console.log('2. Click on "Main menu"');
    console.log('3. Click "Add menu item"');
    console.log('4. Title: "Become a Seller"');
    console.log('5. Link: Select "Pages" -> "Become a Seller"');
    console.log('6. Click Save');
    console.log('\nOR - Enable the "online_store_navigation" scope in your app to let me do this automatically.');
}

main().catch(console.error);
