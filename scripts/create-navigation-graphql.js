const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function graphqlRequest(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query, variables });

        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/graphql.json',
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': data.length
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
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Setting Up Navigation Menu via GraphQL            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // First, get existing menus
    const getMenusQuery = `
    {
        menus(first: 10) {
            edges {
                node {
                    id
                    title
                    handle
                    itemsCount
                }
            }
        }
    }`;

    console.log('Fetching existing menus...');
    const menusResult = await graphqlRequest(getMenusQuery);

    if (menusResult.errors) {
        console.log('GraphQL Errors:', JSON.stringify(menusResult.errors, null, 2));
    }

    if (menusResult.data?.menus?.edges) {
        console.log('Found menus:');
        for (const edge of menusResult.data.menus.edges) {
            console.log(`  - ${edge.node.title} (${edge.node.handle}) - ${edge.node.itemsCount} items`);
            console.log(`    ID: ${edge.node.id}`);
        }
    }

    // Get main-menu details
    const getMainMenuQuery = `
    {
        menu(handle: "main-menu") {
            id
            title
            handle
            items {
                id
                title
                url
                items {
                    id
                    title
                    url
                }
            }
        }
    }`;

    console.log('\nFetching main-menu details...');
    const mainMenuResult = await graphqlRequest(getMainMenuQuery);

    if (mainMenuResult.data?.menu) {
        console.log('Main Menu Items:');
        for (const item of mainMenuResult.data.menu.items || []) {
            console.log(`  - ${item.title}: ${item.url}`);
            for (const subItem of item.items || []) {
                console.log(`    └── ${subItem.title}: ${subItem.url}`);
            }
        }
    }

    // Create menu update mutation
    console.log('\n=== Creating Menu Items ===\n');

    // Menu item structure we want to create
    const menuItems = [
        { title: 'Home', url: '/' },
        {
            title: 'Shop by Category',
            items: [
                { title: 'Financial Services', url: '/collections/financial-services' },
                { title: 'Education Services', url: '/collections/education-services' },
                { title: 'Garlands & Malas', url: '/collections/garlands-malas' },
                { title: 'Books & Media', url: '/collections/books-media-1' },
                { title: 'Puja Items', url: '/collections/puja-items' },
                { title: 'Plants & Garden', url: '/collections/plants-garden' },
                { title: 'Health & Wellness', url: '/collections/health-wellness-1' },
                { title: 'Catering & Food', url: '/collections/catering-food' },
            ]
        },
        {
            title: 'Shop by Seller',
            items: [
                { title: 'Artha Financial Wisdom', url: '/collections/artha-financial-wisdom' },
                { title: 'Vidya College Mentors', url: '/collections/vidya-college-mentors' },
                { title: 'Vrindavan Garlands', url: '/collections/vrindavan-garlands' },
                { title: 'Govinda Books', url: '/collections/govinda-books' },
                { title: 'Deity Seva Store', url: '/collections/deity-seva-store' },
                { title: 'Tulsi Nursery', url: '/collections/tulsi-nursery' },
                { title: 'Ayur Wellness', url: '/collections/ayur-wellness' },
            ]
        },
        { title: 'All Sellers', url: '/apps/marketplace/sellerlist' },
        { title: 'All Products', url: '/collections/all' },
    ];

    // Note: Shopify's menu API is read-only via GraphQL for Online Store 2.0
    // Menu items must be updated through the Admin UI or theme customization

    console.log('Note: Shopify menu updates require Admin UI access.');
    console.log('Please follow these steps:\n');

    console.log('1. Go to: https://admin.shopify.com/store/seva-dev/menus');
    console.log('2. Click on "Main menu"');
    console.log('3. Delete existing items (or keep Home)');
    console.log('4. Add new menu items:\n');

    console.log('   HOME → /');
    console.log('   SHOP BY CATEGORY → # (add sub-items)');
    for (const item of menuItems[1].items) {
        console.log(`      └── ${item.title} → ${item.url}`);
    }
    console.log('   SHOP BY SELLER → # (add sub-items)');
    for (const item of menuItems[2].items) {
        console.log(`      └── ${item.title} → ${item.url}`);
    }
    console.log('   ALL SELLERS → /apps/marketplace/sellerlist');
    console.log('   ALL PRODUCTS → /collections/all');

    console.log('\n5. Click "Save menu"');
}

main().catch(console.error);
