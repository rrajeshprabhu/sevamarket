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
    console.log('=== Updating Navigation with Categories ===\n');

    // Step 1: Get all collections
    console.log('1. Getting existing collections...');
    const collections = await shopifyRequest('GET', '/custom_collections.json');
    const customCollections = collections.data.custom_collections || [];

    // Also get smart collections
    const smartCollections = await shopifyRequest('GET', '/smart_collections.json');
    const allSmartCollections = smartCollections.data.smart_collections || [];

    console.log('Custom Collections:', customCollections.map(c => c.title));
    console.log('Smart Collections:', allSmartCollections.map(c => c.title));

    // Step 2: Get existing menus
    console.log('\n2. Getting existing menus...');
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
    const menus = menusResult.data?.data?.menus?.edges || [];
    console.log('Existing menus:', menus.map(m => m.node.title));

    // Step 3: Create a new "Categories" menu
    console.log('\n3. Creating/Updating Categories menu...');

    // Build category menu items from collections
    const categoryItems = [
        { title: "All Products", resourceId: null, type: "HTTP", url: "/collections/all" },
    ];

    // Add each collection as a menu item
    for (const collection of customCollections) {
        categoryItems.push({
            title: collection.title,
            type: "HTTP",
            url: `/collections/${collection.handle}`
        });
    }

    // Check if categories menu exists
    const existingCategoriesMenu = menus.find(m =>
        m.node.handle === 'categories' ||
        m.node.title.toLowerCase().includes('categories')
    );

    if (existingCategoriesMenu) {
        console.log('Categories menu already exists, updating...');

        // Delete and recreate to update items
        const deleteMenuMutation = `
            mutation menuDelete($id: ID!) {
                menuDelete(id: $id) {
                    deletedMenuId
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;
        await shopifyGraphQL(deleteMenuMutation, { id: existingCategoriesMenu.node.id });
    }

    // Create categories menu
    const createCategoriesMenuMutation = `
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

    const categoriesMenuResult = await shopifyGraphQL(createCategoriesMenuMutation, {
        title: "Categories",
        handle: "categories",
        items: categoryItems
    });

    if (categoriesMenuResult.data?.data?.menuCreate?.menu) {
        console.log('✓ Categories menu created!');
        console.log('Items:', categoriesMenuResult.data.data.menuCreate.menu.items.map(i => i.title));
    } else {
        console.log('Categories menu result:', JSON.stringify(categoriesMenuResult, null, 2));
    }

    // Step 4: Update main menu with category dropdown
    console.log('\n4. Updating main menu with categories...');

    const mainMenu = menus.find(m =>
        m.node.handle === 'main-menu' ||
        m.node.handle === 'main-menu-1' ||
        m.node.title.toLowerCase().includes('main')
    );

    if (mainMenu) {
        console.log('Found main menu:', mainMenu.node.title);
        console.log('Current items:', mainMenu.node.items.map(i => i.title));

        // Build new menu items - add Categories as a parent item with nested items
        const newMenuItems = [
            { title: "Home", type: "HTTP", url: "/" },
            {
                title: "Browse Categories",
                type: "HTTP",
                url: "/collections",
                items: categoryItems.map(item => ({
                    title: item.title,
                    type: "HTTP",
                    url: item.url
                }))
            },
            { title: "Food & Delivery", type: "HTTP", url: "/collections/food-delivery" },
            { title: "Classes", type: "HTTP", url: "/collections/classes-workshops" },
            { title: "Real Estate", type: "HTTP", url: "/collections/real-estate-services" },
            { title: "Wellness", type: "HTTP", url: "/collections/wellness-yoga" },
            { title: "Catering", type: "HTTP", url: "/collections/catering-events" },
            { title: "Become a Seller", type: "HTTP", url: "/pages/become-a-seller" }
        ];

        // Delete and recreate main menu
        const deleteMenuMutation = `
            mutation menuDelete($id: ID!) {
                menuDelete(id: $id) {
                    deletedMenuId
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;
        await shopifyGraphQL(deleteMenuMutation, { id: mainMenu.node.id });

        // Create updated main menu
        const createMainMenuMutation = `
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

        const mainMenuResult = await shopifyGraphQL(createMainMenuMutation, {
            title: "Main menu",
            handle: "main-menu",
            items: newMenuItems
        });

        if (mainMenuResult.data?.data?.menuCreate?.menu) {
            console.log('✓ Main menu updated with categories!');
            console.log('New items:', mainMenuResult.data.data.menuCreate.menu.items.map(i => i.title));
        } else {
            console.log('Main menu result:', JSON.stringify(mainMenuResult, null, 2));
        }
    } else {
        console.log('No main menu found, creating new one...');

        const createMainMenuMutation = `
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

        const newMenuItems = [
            { title: "Home", type: "HTTP", url: "/" },
            { title: "Food & Delivery", type: "HTTP", url: "/collections/food-delivery" },
            { title: "Classes", type: "HTTP", url: "/collections/classes-workshops" },
            { title: "Real Estate", type: "HTTP", url: "/collections/real-estate-services" },
            { title: "Wellness", type: "HTTP", url: "/collections/wellness-yoga" },
            { title: "Catering", type: "HTTP", url: "/collections/catering-events" },
            { title: "Become a Seller", type: "HTTP", url: "/pages/become-a-seller" }
        ];

        const mainMenuResult = await shopifyGraphQL(createMainMenuMutation, {
            title: "Main menu",
            handle: "main-menu",
            items: newMenuItems
        });

        console.log('Create main menu result:', JSON.stringify(mainMenuResult, null, 2));
    }

    // Step 5: Verify theme is using main-menu
    console.log('\n5. Checking theme settings...');
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (mainTheme) {
        console.log('Main theme:', mainTheme.name);

        // Get header-group.json
        const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

        if (headerGroupAsset.data?.asset?.value) {
            const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);

            // Update to use main-menu
            if (headerGroup.sections?.header?.settings) {
                headerGroup.sections.header.settings.menu = 'main-menu';

                const updateResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                    asset: {
                        key: 'sections/header-group.json',
                        value: JSON.stringify(headerGroup, null, 2)
                    }
                });

                if (updateResult.status === 200) {
                    console.log('✓ Theme header updated to use main-menu');
                }
            }
        }
    }

    console.log('\n=== Navigation Update Complete ===');
    console.log('\nYour store now has category navigation:');
    console.log('- Home');
    console.log('- Food & Delivery');
    console.log('- Classes');
    console.log('- Real Estate');
    console.log('- Wellness');
    console.log('- Catering');
    console.log('- Become a Seller');
    console.log('\nVisit: https://seva-dev.myshopify.com');
}

main().catch(console.error);
