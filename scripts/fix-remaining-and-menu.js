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
    console.log('=== FIXING REMAINING ISSUES ===\n');

    // 1. Fix remaining collection images with different URLs
    console.log('1. Fixing Puja Items and Education Services collection images...\n');

    const smartCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = smartCollections.data.smart_collections || [];

    const remainingFixes = {
        'puja-items': {
            // Diya/lamp image
            image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800',
            alt: 'Puja Items - Diya and Accessories'
        },
        'education-services': {
            // Students/graduation
            image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
            alt: 'Education and College Prep Services'
        }
    };

    for (const collection of collections) {
        const fix = remainingFixes[collection.handle];
        if (fix) {
            console.log(`Updating: ${collection.title}`);

            const result = await shopifyRequest('PUT', `/smart_collections/${collection.id}.json`, {
                smart_collection: {
                    id: collection.id,
                    image: {
                        src: fix.image,
                        alt: fix.alt
                    }
                }
            });

            if (result.status === 200) {
                console.log(`  ✓ Fixed: ${collection.title}`);
            } else {
                console.log(`  ✗ Failed: ${result.status} - ${JSON.stringify(result.data).substring(0, 100)}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    // 2. Delete duplicate products
    console.log('\n2. Deleting Duplicate Products...\n');

    const duplicateIds = [
        9282247295201,  // Hing Breadsticks duplicate
        9282274525409,  // Kirtan Melodies duplicate
        9282246803681,  // Margherita Pizza duplicate
        9282247033057,  // Paneer Tikka Pizza duplicate
        9282247622881   // Veggie Supreme Pizza duplicate
    ];

    for (const id of duplicateIds) {
        const result = await shopifyRequest('DELETE', `/products/${id}.json`);
        if (result.status === 200) {
            console.log(`  ✓ Deleted duplicate product ${id}`);
        } else {
            console.log(`  ✗ Failed to delete ${id}: ${result.status}`);
        }
        await new Promise(r => setTimeout(r, 300));
    }

    // 3. Check menus
    console.log('\n3. Checking Navigation Menus...\n');

    const menusResult = await shopifyRequest('GET', '/menus.json');

    if (menusResult.status === 200) {
        const menus = menusResult.data.menus || [];
        console.log(`Found ${menus.length} menus:`);
        for (const menu of menus) {
            console.log(`  - ${menu.title} (handle: ${menu.handle}, id: ${menu.id})`);
            if (menu.items) {
                for (const item of menu.items) {
                    console.log(`    └─ ${item.title}: ${item.url}`);
                }
            }
        }
    } else {
        console.log('Menus API returned:', menusResult.status);
    }

    // 4. Try to update menu via GraphQL
    console.log('\n4. Attempting to Update Menu via GraphQL...\n');

    // GraphQL mutation to update menu
    const graphqlEndpoint = '/admin/api/2024-01/graphql.json';

    // First get the menu ID
    const menuQuery = `
    {
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

    const menuQueryResult = await shopifyRequest('POST', graphqlEndpoint, {
        query: menuQuery
    });

    if (menuQueryResult.status === 200 && menuQueryResult.data.data) {
        const menus = menuQueryResult.data.data.menus.edges;
        console.log('Menus from GraphQL:');
        for (const edge of menus) {
            const menu = edge.node;
            console.log(`  ${menu.title} (${menu.handle})`);
            console.log(`    ID: ${menu.id}`);
            if (menu.items) {
                for (const item of menu.items) {
                    console.log(`    - ${item.title}: ${item.url}`);
                }
            }
        }

        // Find main-menu
        const mainMenu = menus.find(m => m.node.handle === 'main-menu');
        if (mainMenu) {
            console.log(`\nMain Menu ID: ${mainMenu.node.id}`);

            // Try to update the menu
            const updateMutation = `
            mutation menuUpdate($id: ID!, $items: [MenuItemInput!]!) {
              menuUpdate(id: $id, items: $items) {
                menu {
                  id
                  title
                }
                userErrors {
                  field
                  message
                }
              }
            }
            `;

            const menuItems = [
                { title: "Home", url: "/" },
                { title: "Browse", url: "/pages/browse" },
                {
                    title: "Categories",
                    items: [
                        { title: "Puja Items", url: "/collections/puja-items" },
                        { title: "Books & Media", url: "/collections/books-media-1" },
                        { title: "Garlands & Malas", url: "/collections/garlands-malas" },
                        { title: "Health & Wellness", url: "/collections/health-wellness-1" },
                        { title: "Plants & Garden", url: "/collections/plants-garden" },
                        { title: "Catering & Food", url: "/collections/catering-food" },
                        { title: "Financial Services", url: "/collections/financial-services" },
                        { title: "Education", url: "/collections/education-services" },
                        { title: "Music & Lessons", url: "/collections/music-lessons" },
                        { title: "Yoga & Wellness", url: "/collections/yoga-wellness" }
                    ]
                },
                {
                    title: "Sellers",
                    items: [
                        { title: "Govinda Books", url: "/collections/govinda-books" },
                        { title: "Vrindavan Garlands", url: "/collections/vrindavan-garlands" },
                        { title: "Deity Seva Store", url: "/collections/deity-seva-store" },
                        { title: "Prabhu Pizza", url: "/collections/prabhu-pizza" },
                        { title: "Govinda's Catering", url: "/collections/govindas-catering" },
                        { title: "Tulsi Nursery", url: "/collections/tulsi-nursery" },
                        { title: "Ayur Wellness", url: "/collections/ayur-wellness" },
                        { title: "Artha Financial", url: "/collections/artha-financial-wisdom" },
                        { title: "Vidya Mentors", url: "/collections/vidya-college-mentors" },
                        { title: "Radha Sangeet", url: "/collections/radha-sangeet-music-academy" },
                        { title: "Shanti Yoga", url: "/collections/shanti-yoga-studio" },
                        { title: "Kasam Realty", url: "/collections/kasam-realty" }
                    ]
                },
                { title: "Become a Seller", url: "/pages/become-a-seller" }
            ];

            const updateResult = await shopifyRequest('POST', graphqlEndpoint, {
                query: updateMutation,
                variables: {
                    id: mainMenu.node.id,
                    items: menuItems
                }
            });

            if (updateResult.data.data && updateResult.data.data.menuUpdate) {
                if (updateResult.data.data.menuUpdate.userErrors.length > 0) {
                    console.log('Menu update errors:', updateResult.data.data.menuUpdate.userErrors);
                } else {
                    console.log('✓ Menu updated successfully!');
                }
            } else {
                console.log('Menu update response:', JSON.stringify(updateResult.data).substring(0, 500));
            }
        }
    }

    console.log('\n=== COMPLETE ===');
    console.log('\nNote: If menu update via API fails, you need to update it manually in Shopify Admin:');
    console.log('  1. Go to Online Store → Navigation');
    console.log('  2. Edit "Main menu"');
    console.log('  3. Add Categories dropdown with all category collections');
    console.log('  4. Add Sellers dropdown with all seller collections');
}

main().catch(console.error);
