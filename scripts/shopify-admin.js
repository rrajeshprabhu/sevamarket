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
    console.log('=== Shopify Admin - Add Become a Seller to Navigation ===\n');

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

    // Step 2: Get navigation menus via GraphQL
    console.log('\n2. Getting navigation menus...');

    const getMenusQuery = `
        query {
            menus(first: 10) {
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
    console.log('Menus Result:', JSON.stringify(menusResult, null, 2));

    if (menusResult.data?.data?.menus?.edges?.length > 0) {
        const menus = menusResult.data.data.menus.edges;
        console.log('Found menus:', menus.map(m => `${m.node.title} (${m.node.handle})`));

        // Find main menu
        const mainMenu = menus.find(m =>
            m.node.handle === 'main-menu' ||
            m.node.handle === 'header' ||
            m.node.title.toLowerCase().includes('main')
        );

        if (mainMenu) {
            console.log('\n3. Found main menu:', mainMenu.node.title);
            console.log('Current items:', mainMenu.node.items.map(i => i.title));

            // Check if "Become a Seller" already exists
            const alreadyExists = mainMenu.node.items.some(item =>
                item.title.toLowerCase().includes('seller') ||
                (item.url && item.url.includes('become-a-seller'))
            );

            if (alreadyExists) {
                console.log('\n✓ "Become a Seller" link already exists in menu!');
            } else {
                console.log('\n4. Adding "Become a Seller" to menu...');

                // Build items array for mutation
                const existingItems = mainMenu.node.items.map(item => ({
                    title: item.title,
                    url: item.url
                }));

                // Add new item
                existingItems.push({
                    title: "Become a Seller",
                    url: "/pages/become-a-seller"
                });

                const updateMenuMutation = `
                    mutation menuUpdate($id: ID!, $items: [MenuItemUpdateInput!]!) {
                        menuUpdate(id: $id, items: $items) {
                            menu {
                                id
                                title
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

                const updateResult = await shopifyGraphQL(updateMenuMutation, {
                    id: mainMenu.node.id,
                    items: existingItems
                });

                console.log('Menu Update Result:', JSON.stringify(updateResult, null, 2));

                if (updateResult.data?.data?.menuUpdate?.menu) {
                    console.log('\n✓ SUCCESS! "Become a Seller" link added to navigation!');
                    console.log('Updated menu items:', updateResult.data.data.menuUpdate.menu.items.map(i => i.title));
                } else if (updateResult.data?.data?.menuUpdate?.userErrors?.length > 0) {
                    console.log('\n✗ Error:', updateResult.data.data.menuUpdate.userErrors);
                }
            }
        } else {
            console.log('\nNo main menu found. Creating one...');
            // Create a new menu with the Become a Seller link
            const createMenuMutation = `
                mutation menuCreate($title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
                    menuCreate(title: $title, handle: $handle, items: $items) {
                        menu {
                            id
                            title
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

            const createResult = await shopifyGraphQL(createMenuMutation, {
                title: "Main Menu",
                handle: "main-menu",
                items: [
                    { title: "Home", url: "/" },
                    { title: "Catalog", url: "/collections/all" },
                    { title: "Become a Seller", url: "/pages/become-a-seller" },
                    { title: "Contact", url: "/pages/contact" }
                ]
            });

            console.log('Create Menu Result:', JSON.stringify(createResult, null, 2));
        }
    } else {
        console.log('\nNo menus found via GraphQL. Trying to create a menu...');

        // Create a new menu with the Become a Seller link
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

        const createResult = await shopifyGraphQL(createMenuMutation, {
            title: "Main menu",
            handle: "main-menu",
            items: [
                { title: "Home", url: "/", type: "HTTP" },
                { title: "Catalog", url: "/collections/all", type: "HTTP" },
                { title: "Become a Seller", url: "/pages/become-a-seller", type: "HTTP" },
                { title: "Contact", url: "/pages/contact", type: "HTTP" }
            ]
        });

        console.log('Create Menu Result:', JSON.stringify(createResult, null, 2));

        if (createResult.data?.data?.menuCreate?.menu) {
            console.log('\n✓ SUCCESS! Menu created with "Become a Seller" link!');
        } else if (createResult.data?.data?.menuCreate?.userErrors?.length > 0) {
            console.log('\nMenu creation errors:', createResult.data.data.menuCreate.userErrors);
        }
    }

    // Step 3: Update theme header to use the new menu
    console.log('\n3. Checking theme header settings...');
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (mainTheme) {
        console.log('Main theme:', mainTheme.name, '(ID:', mainTheme.id + ')');

        // Get the header section settings
        const headerAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);
        console.log('Header group settings:', JSON.stringify(headerAsset.data?.asset?.value, null, 2)?.substring(0, 500));

        // Get the main header liquid to understand structure
        const headerLiquid = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header.liquid`);

        if (headerLiquid.data?.asset?.value) {
            // Check what menu handle the theme uses
            const menuMatch = headerLiquid.data.asset.value.match(/menu:\s*['"]([^'"]+)['"]/);
            if (menuMatch) {
                console.log('Theme uses menu handle:', menuMatch[1]);
            }

            // Look for settings schema
            const schemaMatch = headerLiquid.data.asset.value.match(/{% schema %}([\s\S]*?){% endschema %}/);
            if (schemaMatch) {
                try {
                    const schema = JSON.parse(schemaMatch[1]);
                    const menuSetting = schema.settings?.find(s => s.id === 'menu' || s.type === 'link_list');
                    if (menuSetting) {
                        console.log('Menu setting found:', menuSetting);
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        }

        // Try to get settings_data.json which contains the actual menu selection
        const settingsData = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`);

        if (settingsData.data?.asset?.value) {
            const settings = JSON.parse(settingsData.data.asset.value);
            console.log('\nLooking for header section in theme settings...');

            // Find header section in current settings
            const currentPreset = settings.current;
            let presetSettings = typeof currentPreset === 'string' ? settings.presets[currentPreset] : currentPreset;

            // If it's a string reference, we need to update both
            if (typeof settings.current === 'string') {
                console.log('Current preset name:', settings.current);
                presetSettings = settings.presets[settings.current];
            }

            console.log('Preset sections keys:', Object.keys(presetSettings?.sections || {}));

            // The header settings might be in header-group.json instead
            // Let's update header-group.json directly
            const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

            if (headerGroupAsset.data?.asset?.value) {
                const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);
                console.log('\nHeader group sections:', Object.keys(headerGroup.sections || {}));

                // Find the header section and update its menu setting
                if (headerGroup.sections?.header?.settings) {
                    console.log('Current header menu setting:', headerGroup.sections.header.settings.menu);

                    if (headerGroup.sections.header.settings.menu !== 'main-menu-1') {
                        console.log('\n4. Updating header-group.json to use new menu...');
                        headerGroup.sections.header.settings.menu = 'main-menu-1';

                        const updateResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                            asset: {
                                key: 'sections/header-group.json',
                                value: JSON.stringify(headerGroup, null, 2)
                            }
                        });

                        if (updateResult.status === 200) {
                            console.log('✓ Theme header updated to use new menu with "Become a Seller" link!');
                        } else {
                            console.log('Update result:', JSON.stringify(updateResult, null, 2));
                        }
                    } else {
                        console.log('✓ Header already using correct menu');
                    }
                } else {
                    // Add menu setting if it doesn't exist
                    console.log('\n4. Adding menu setting to header section...');
                    headerGroup.sections = headerGroup.sections || {};
                    headerGroup.sections.header = headerGroup.sections.header || {};
                    headerGroup.sections.header.settings = headerGroup.sections.header.settings || {};
                    headerGroup.sections.header.settings.menu = 'main-menu-1';

                    const updateResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                        asset: {
                            key: 'sections/header-group.json',
                            value: JSON.stringify(headerGroup, null, 2)
                        }
                    });

                    if (updateResult.status === 200) {
                        console.log('✓ Theme header updated to use new menu with "Become a Seller" link!');
                    } else {
                        console.log('Update result:', JSON.stringify(updateResult, null, 2));
                    }
                }
            }
        }
    }

    console.log('\n=== Done ===');
    console.log('Visit your store at: https://seva-dev.myshopify.com');
    console.log('The "Become a Seller" link should now be visible in the navigation!');
}

main().catch(console.error);
