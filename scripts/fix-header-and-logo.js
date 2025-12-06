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
    const themeId = 157097328865;

    console.log('=== Fixing Header and Logo ===\n');

    // Updated header configuration
    const newHeaderGroup = {
        "name": "t:sections.header.name",
        "type": "header",
        "sections": {
            "announcement-bar": {
                "type": "announcement-bar",
                "blocks": {
                    "announcement-bar-0": {
                        "type": "announcement",
                        "settings": {
                            "text": "Welcome to Seva Marketplace - Sacred products from our temple community",
                            "text_alignment": "center",
                            "color_scheme": "accent-1",
                            "link": ""
                        }
                    }
                },
                "block_order": ["announcement-bar-0"],
                "disabled": false,
                "settings": {}
            },
            "header": {
                "type": "header",
                "settings": {
                    "logo_position": "top-left",
                    "menu": "main-menu",
                    "menu_type_desktop": "dropdown",
                    "sticky_header_type": "always",
                    "show_line_separator": true,
                    "color_scheme": "background-1",
                    "enable_country_selector": false,
                    "enable_language_selector": false,
                    "mobile_logo_position": "center",
                    "margin_bottom": 0,
                    "padding_top": 12,
                    "padding_bottom": 12
                }
            }
        },
        "order": ["announcement-bar", "header"]
    };

    // Update header group
    const headerResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'sections/header-group.json',
            value: JSON.stringify(newHeaderGroup, null, 2)
        }
    });

    if (headerResult.status === 200) {
        console.log('✓ Header updated:');
        console.log('  - Logo moved to TOP-LEFT');
        console.log('  - Using main-menu (not main-menu-2)');
        console.log('  - Announcement bar enabled');
    } else {
        console.log('Header update failed:', headerResult.status);
    }

    // Now update theme settings for logo
    console.log('\n=== Updating Theme Settings ===\n');

    // Get current settings
    const settingsResult = await shopifyRequest('GET', `/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`);
    let settings = JSON.parse(settingsResult.data.asset.value);

    // Update logo width
    if (settings.current && typeof settings.current === 'object') {
        settings.current.logo_width = 120;
    } else if (settings.presets && settings.presets.Default) {
        settings.presets.Default.logo_width = 120;
    }

    const settingsUpdateResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify(settings, null, 2)
        }
    });

    if (settingsUpdateResult.status === 200) {
        console.log('✓ Logo width set to 120px');
    }

    // Fix Become a Seller page - remove duplicate heading
    console.log('\n=== Fixing Become a Seller Page ===\n');

    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const sellerPage = pagesResult.data.pages.find(p => p.handle === 'become-a-seller');

    if (sellerPage) {
        // Check if the content starts with a heading that duplicates the title
        let content = sellerPage.body_html || '';

        // Remove any leading h1 that says "Become a Seller"
        content = content.replace(/<h1[^>]*>.*?Become a Seller.*?<\/h1>/gi, '');
        content = content.replace(/<h1[^>]*>.*?Become A Seller.*?<\/h1>/gi, '');

        const updateResult = await shopifyRequest('PUT', `/pages/${sellerPage.id}.json`, {
            page: {
                id: sellerPage.id,
                body_html: content
            }
        });

        if (updateResult.status === 200) {
            console.log('✓ Become a Seller page - duplicate heading removed');
        }
    }

    // Also fix Browse page heading
    const browsePage = pagesResult.data.pages.find(p => p.handle === 'browse');
    if (browsePage) {
        let content = browsePage.body_html || '';
        content = content.replace(/<h1[^>]*>.*?Browse.*?<\/h1>/gi, '');

        const updateResult = await shopifyRequest('PUT', `/pages/${browsePage.id}.json`, {
            page: {
                id: browsePage.id,
                body_html: content
            }
        });

        if (updateResult.status === 200) {
            console.log('✓ Browse page - duplicate heading removed');
        }
    }

    console.log('\n=== Done! ===');
    console.log('\nNOTE: To add a logo image, you need to:');
    console.log('1. Go to Shopify Admin → Online Store → Themes');
    console.log('2. Click Customize on your theme');
    console.log('3. Click on the Header section');
    console.log('4. Upload your logo image');
}

main().catch(console.error);
