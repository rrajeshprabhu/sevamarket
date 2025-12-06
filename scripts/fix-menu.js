const https = require('https');

// Shopify API Configuration
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
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
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
    console.log('=== Fixing Navigation Menu ===\n');

    // Step 1: List all menus
    console.log('1. Getting all menus...');
    const getMenusQuery = `
        query {
            menus(first: 20) {
                edges {
                    node {
                        id
                        title
                        handle
                        items {
                            id
                            title
                            url
                        }
                    }
                }
            }
        }
    `;

    const menusResult = await shopifyGraphQL(getMenusQuery);
    const menus = menusResult.data?.data?.menus?.edges || [];

    console.log('All menus:');
    for (const menu of menus) {
        console.log(`  - ${menu.node.title} (handle: ${menu.node.handle})`);
        console.log(`    Items: ${menu.node.items.map(i => i.title).join(', ')}`);
    }

    // Step 2: Get theme settings to find which menu is used
    console.log('\n2. Getting theme settings...');
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (mainTheme) {
        console.log('Main theme:', mainTheme.name, '(ID:', mainTheme.id + ')');

        // Get header-group.json to see current menu setting
        const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

        if (headerGroupAsset.data?.asset?.value) {
            const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);
            console.log('\nCurrent header menu setting:', headerGroup.sections?.header?.settings?.menu || 'not set');
            console.log('Header sections:', Object.keys(headerGroup.sections || {}));
        }
    }

    // Step 3: Find or update the menu that the header uses (typically "main-menu" handle)
    console.log('\n3. Updating main-menu with categories...');

    // Find menu with handle "main-menu"
    let mainMenu = menus.find(m => m.node.handle === 'main-menu');

    if (mainMenu) {
        console.log('Found main-menu, updating items...');

        // Use menuUpdate to add new items
        const updateMenuMutation = `
            mutation menuUpdate($id: ID!, $title: String, $items: [MenuItemUpdateInput!]) {
                menuUpdate(id: $id, title: $title, items: $items) {
                    menu {
                        id
                        title
                        handle
                        items {
                            id
                            title
                            url
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const newItems = [
            { title: "Home", url: "/" },
            { title: "Food & Delivery", url: "/collections/food-delivery" },
            { title: "Classes", url: "/collections/classes-workshops" },
            { title: "Real Estate", url: "/collections/real-estate-services" },
            { title: "Wellness", url: "/collections/wellness-yoga" },
            { title: "Catering", url: "/collections/catering-events" },
            { title: "All Products", url: "/collections/all" },
            { title: "Become a Seller", url: "/pages/become-a-seller" }
        ];

        const updateResult = await shopifyGraphQL(updateMenuMutation, {
            id: mainMenu.node.id,
            title: "Main menu",
            items: newItems
        });

        if (updateResult.data?.data?.menuUpdate?.menu) {
            console.log('✓ Menu updated successfully!');
            console.log('New items:', updateResult.data.data.menuUpdate.menu.items.map(i => i.title));
        } else {
            console.log('Update result:', JSON.stringify(updateResult, null, 2));
        }
    } else {
        console.log('No main-menu found, creating one...');

        const createMenuMutation = `
            mutation menuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
                menuCreate(title: $title, handle: $handle, items: $items) {
                    menu {
                        id
                        title
                        handle
                        items {
                            title
                            url
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const newItems = [
            { title: "Home", type: "HTTP", url: "/" },
            { title: "Food & Delivery", type: "HTTP", url: "/collections/food-delivery" },
            { title: "Classes", type: "HTTP", url: "/collections/classes-workshops" },
            { title: "Real Estate", type: "HTTP", url: "/collections/real-estate-services" },
            { title: "Wellness", type: "HTTP", url: "/collections/wellness-yoga" },
            { title: "Catering", type: "HTTP", url: "/collections/catering-events" },
            { title: "All Products", type: "HTTP", url: "/collections/all" },
            { title: "Become a Seller", type: "HTTP", url: "/pages/become-a-seller" }
        ];

        const createResult = await shopifyGraphQL(createMenuMutation, {
            title: "Main menu",
            handle: "main-menu",
            items: newItems
        });

        console.log('Create result:', JSON.stringify(createResult, null, 2));
    }

    // Step 4: Update the theme header to use main-menu
    console.log('\n4. Updating theme header to use main-menu...');

    if (mainTheme) {
        const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

        if (headerGroupAsset.data?.asset?.value) {
            const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);

            // Ensure header section exists and set menu
            headerGroup.sections = headerGroup.sections || {};
            headerGroup.sections.header = headerGroup.sections.header || { type: "header", settings: {} };
            headerGroup.sections.header.settings = headerGroup.sections.header.settings || {};
            headerGroup.sections.header.settings.menu = 'main-menu';

            const updateResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                asset: {
                    key: 'sections/header-group.json',
                    value: JSON.stringify(headerGroup, null, 2)
                }
            });

            if (updateResult.status === 200) {
                console.log('✓ Theme header updated to use main-menu');
            } else {
                console.log('Theme update failed:', updateResult.status);
            }
        }
    }

    console.log('\n=== Done ===');
    console.log('Refresh your browser to see the new navigation!');
}

main().catch(console.error);
