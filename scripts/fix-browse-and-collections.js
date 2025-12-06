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

// All sellers that should have collections
const allSellers = [
    'Artha Financial Wisdom',
    'Ayur Wellness',
    'Deity Seva Store',
    'Govinda Books',
    "Govinda's Catering",
    'Kasam Realty',
    'Prabhu Pizza',
    'Radha Sangeet Music Academy',
    'Shanti Yoga Studio',
    'Tulsi Nursery',
    'Vidya College Mentors',
    'Vrindavan Garlands'
];

async function createSellerCollection(sellerName) {
    console.log(`Creating collection for: ${sellerName}`);

    const collectionData = {
        smart_collection: {
            title: sellerName,
            rules: [{
                column: 'vendor',
                relation: 'equals',
                condition: sellerName
            }],
            disjunctive: false,
            published: true
        }
    };

    const result = await shopifyRequest('POST', '/smart_collections.json', collectionData);

    if (result.status === 201 || result.status === 200) {
        console.log(`  ✓ Created: ${sellerName}`);
        return result.data.smart_collection;
    } else if (result.status === 422 && JSON.stringify(result.data).includes('already')) {
        console.log(`  - Already exists: ${sellerName}`);
        return null;
    } else {
        console.log(`  ✗ Failed: ${result.status}`);
        return null;
    }
}

async function main() {
    console.log('=== Creating Missing Seller Collections ===\n');

    // Get existing collections
    const existingResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const existingCollections = existingResult.data.smart_collections || [];
    const existingTitles = existingCollections.map(c => c.title.toLowerCase());

    // Create missing seller collections
    for (const seller of allSellers) {
        if (!existingTitles.includes(seller.toLowerCase())) {
            await createSellerCollection(seller);
            await new Promise(r => setTimeout(r, 500));
        } else {
            console.log(`  - Exists: ${seller}`);
        }
    }

    // Now get all collections to build the browse page
    console.log('\n=== Getting All Collections ===\n');
    const allCollectionsResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const allCollections = allCollectionsResult.data.smart_collections || [];

    // Build seller links
    const sellerLinks = [];
    for (const seller of allSellers) {
        const collection = allCollections.find(c => c.title.toLowerCase() === seller.toLowerCase());
        if (collection) {
            sellerLinks.push(`        <li style="padding: 8px 0;"><a href="/collections/${collection.handle}" style="color: #333; text-decoration: none;">${seller}</a></li>`);
        }
    }

    console.log('Seller links prepared:', sellerLinks.length);

    // Update browse page with ALL sellers
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const browsePage = pagesResult.data.pages.find(p => p.handle === 'browse');

    if (!browsePage) {
        console.log('Browse page not found!');
        return;
    }

    const newContent = `
<div class="browse-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
  <p style="text-align: center; font-size: 18px; color: #666; margin-bottom: 30px;">Discover products and services from our temple community vendors</p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">

    <div style="background: #f8f8f8; padding: 20px; border-radius: 10px;">
      <h2 style="color: #8B4513; border-bottom: 2px solid #FF9933; padding-bottom: 10px;">Shop by Category</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0;"><a href="/collections/financial-services" style="color: #333; text-decoration: none;">Financial Services</a></li>
        <li style="padding: 8px 0;"><a href="/collections/education-services" style="color: #333; text-decoration: none;">Education Services</a></li>
        <li style="padding: 8px 0;"><a href="/collections/garlands-malas" style="color: #333; text-decoration: none;">Garlands & Malas</a></li>
        <li style="padding: 8px 0;"><a href="/collections/books-media-1" style="color: #333; text-decoration: none;">Books & Media</a></li>
        <li style="padding: 8px 0;"><a href="/collections/puja-items" style="color: #333; text-decoration: none;">Puja Items</a></li>
        <li style="padding: 8px 0;"><a href="/collections/plants-garden" style="color: #333; text-decoration: none;">Plants & Garden</a></li>
        <li style="padding: 8px 0;"><a href="/collections/health-wellness-1" style="color: #333; text-decoration: none;">Health & Wellness</a></li>
        <li style="padding: 8px 0;"><a href="/collections/catering-food" style="color: #333; text-decoration: none;">Catering & Food</a></li>
        <li style="padding: 8px 0;"><a href="/collections/music-lessons" style="color: #333; text-decoration: none;">Music & Lessons</a></li>
        <li style="padding: 8px 0;"><a href="/collections/yoga-wellness" style="color: #333; text-decoration: none;">Yoga & Wellness</a></li>
        <li style="padding: 8px 0;"><a href="/collections/real-estate" style="color: #333; text-decoration: none;">Real Estate Services</a></li>
      </ul>
    </div>

    <div style="background: #f8f8f8; padding: 20px; border-radius: 10px;">
      <h2 style="color: #8B4513; border-bottom: 2px solid #FF9933; padding-bottom: 10px;">Shop by Seller</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0;"><a href="/collections/artha-financial-wisdom" style="color: #333; text-decoration: none;">Artha Financial Wisdom</a></li>
        <li style="padding: 8px 0;"><a href="/collections/ayur-wellness" style="color: #333; text-decoration: none;">Ayur Wellness</a></li>
        <li style="padding: 8px 0;"><a href="/collections/deity-seva-store" style="color: #333; text-decoration: none;">Deity Seva Store</a></li>
        <li style="padding: 8px 0;"><a href="/collections/govinda-books" style="color: #333; text-decoration: none;">Govinda Books</a></li>
        <li style="padding: 8px 0;"><a href="/collections/govindas-catering" style="color: #333; text-decoration: none;">Govinda's Catering</a></li>
        <li style="padding: 8px 0;"><a href="/collections/kasam-realty" style="color: #333; text-decoration: none;">Kasam Realty</a></li>
        <li style="padding: 8px 0;"><a href="/collections/prabhu-pizza" style="color: #333; text-decoration: none;">Prabhu Pizza</a></li>
        <li style="padding: 8px 0;"><a href="/collections/radha-sangeet-music-academy" style="color: #333; text-decoration: none;">Radha Sangeet Music Academy</a></li>
        <li style="padding: 8px 0;"><a href="/collections/shanti-yoga-studio" style="color: #333; text-decoration: none;">Shanti Yoga Studio</a></li>
        <li style="padding: 8px 0;"><a href="/collections/tulsi-nursery" style="color: #333; text-decoration: none;">Tulsi Nursery</a></li>
        <li style="padding: 8px 0;"><a href="/collections/vidya-college-mentors" style="color: #333; text-decoration: none;">Vidya College Mentors</a></li>
        <li style="padding: 8px 0;"><a href="/collections/vrindavan-garlands" style="color: #333; text-decoration: none;">Vrindavan Garlands</a></li>
      </ul>
    </div>

  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="/collections/all" style="display: inline-block; background: #FF9933; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 10px;">View All Products</a>
  </div>
</div>
`;

    const updateResult = await shopifyRequest('PUT', `/pages/${browsePage.id}.json`, {
        page: {
            id: browsePage.id,
            body_html: newContent
        }
    });

    if (updateResult.status === 200) {
        console.log('\n✓ Browse page updated with all 12 sellers!');
    } else {
        console.log('Failed to update browse page:', updateResult.status);
    }

    // Create additional category collections
    console.log('\n=== Creating Additional Category Collections ===\n');

    const additionalCategories = [
        { title: 'Music & Lessons', type: 'product_type', match: 'Music Lessons' },
        { title: 'Yoga & Wellness', type: 'product_type', match: 'Wellness Services' },
        { title: 'Real Estate Services', type: 'product_type', match: 'Real Estate' }
    ];

    for (const cat of additionalCategories) {
        if (!existingTitles.includes(cat.title.toLowerCase())) {
            const result = await shopifyRequest('POST', '/smart_collections.json', {
                smart_collection: {
                    title: cat.title,
                    rules: [{
                        column: 'type',
                        relation: 'equals',
                        condition: cat.match
                    }],
                    disjunctive: false,
                    published: true
                }
            });
            if (result.status === 201) {
                console.log(`  ✓ Created: ${cat.title}`);
            }
        }
    }

    console.log('\n=== Done! ===');
}

main().catch(console.error);
