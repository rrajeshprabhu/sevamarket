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
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Setting Up Navigation Menu                        ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Get existing menus
    console.log('Checking existing menus...');
    const menusResult = await shopifyRequest('GET', '/menus.json');

    if (menusResult.status === 200) {
        const menus = menusResult.data.menus || [];
        console.log(`Found ${menus.length} menus:`);
        for (const menu of menus) {
            console.log(`  - ${menu.title} (ID: ${menu.id}, Handle: ${menu.handle})`);
        }
    } else {
        console.log('Note: Menus API may require different access. Status:', menusResult.status);
    }

    // Try to get navigation using metafields or check if we need to use Online Store API
    console.log('\n=== Navigation Menu Structure ===\n');
    console.log('The navigation menu needs to be set up in Shopify Admin.');
    console.log('Here is the recommended structure:\n');

    console.log('MAIN MENU:');
    console.log('├── Home (/)');
    console.log('├── Shop by Category');
    console.log('│   ├── Financial Services (/collections/financial-services)');
    console.log('│   ├── Education Services (/collections/education-services)');
    console.log('│   ├── Garlands & Malas (/collections/garlands-malas)');
    console.log('│   ├── Books & Media (/collections/books-media-1)');
    console.log('│   ├── Puja Items (/collections/puja-items)');
    console.log('│   ├── Plants & Garden (/collections/plants-garden)');
    console.log('│   ├── Health & Wellness (/collections/health-wellness-1)');
    console.log('│   └── Catering & Food (/collections/catering-food)');
    console.log('├── Shop by Seller');
    console.log('│   ├── Artha Financial Wisdom (/collections/artha-financial-wisdom)');
    console.log('│   ├── Vidya College Mentors (/collections/vidya-college-mentors)');
    console.log('│   ├── Vrindavan Garlands (/collections/vrindavan-garlands)');
    console.log('│   ├── Govinda Books (/collections/govinda-books)');
    console.log('│   ├── Deity Seva Store (/collections/deity-seva-store)');
    console.log('│   ├── Tulsi Nursery (/collections/tulsi-nursery)');
    console.log('│   └── Ayur Wellness (/collections/ayur-wellness)');
    console.log('├── All Sellers (/apps/marketplace/sellerlist)');
    console.log('└── All Products (/collections/all)');

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  TO SET UP NAVIGATION:                             ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log('║  1. Go to: Shopify Admin                           ║');
    console.log('║  2. Click: Online Store → Navigation               ║');
    console.log('║  3. Click: Main menu                               ║');
    console.log('║  4. Add the menu items as shown above              ║');
    console.log('║  5. Save the menu                                  ║');
    console.log('╚════════════════════════════════════════════════════╝');
}

main().catch(console.error);
