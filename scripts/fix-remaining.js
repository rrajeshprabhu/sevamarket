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
    console.log('=== Fixing Remaining Issues ===\n');

    // Fix College Application image with different URL
    console.log('Fixing College Application Strategy Session...');
    const result = await shopifyRequest('POST', `/products/9282273640673/images.json`, {
        image: {
            src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
            alt: 'College Application Guidance'
        }
    });

    if (result.status === 200 || result.status === 201) {
        console.log('✓ College Application image added');
    } else {
        console.log('✗ Failed:', result.status, JSON.stringify(result.data).substring(0, 200));
    }

    // Check pages
    console.log('\n=== Checking Pages ===\n');
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const pages = pagesResult.data.pages || [];

    console.log('All pages:');
    for (const page of pages) {
        console.log(`  - ${page.title} (${page.handle}) - ${page.published_at ? 'Published' : 'Draft'}`);
        console.log(`    URL: https://seva-dev.myshopify.com/pages/${page.handle}`);
    }

    // Check if browse page exists
    const browsePage = pages.find(p => p.handle === 'browse');
    if (browsePage) {
        console.log('\n✓ Browse page exists!');
        console.log(`  Published: ${browsePage.published_at ? 'Yes' : 'No'}`);
    } else {
        console.log('\n✗ Browse page not found - creating it...');

        const browsePageContent = `
<div class="browse-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
  <h1 style="text-align: center; margin-bottom: 30px;">Browse Our Marketplace</h1>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">

    <div style="background: #f8f8f8; padding: 20px; border-radius: 10px;">
      <h2 style="color: #8B4513; border-bottom: 2px solid #FF9933; padding-bottom: 10px;">🛕 Shop by Category</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0;"><a href="/collections/financial-services" style="color: #333; text-decoration: none;">💰 Financial Services</a></li>
        <li style="padding: 8px 0;"><a href="/collections/education-services" style="color: #333; text-decoration: none;">📚 Education Services</a></li>
        <li style="padding: 8px 0;"><a href="/collections/garlands-malas" style="color: #333; text-decoration: none;">🌺 Garlands & Malas</a></li>
        <li style="padding: 8px 0;"><a href="/collections/books-media-1" style="color: #333; text-decoration: none;">📖 Books & Media</a></li>
        <li style="padding: 8px 0;"><a href="/collections/puja-items" style="color: #333; text-decoration: none;">🪔 Puja Items</a></li>
        <li style="padding: 8px 0;"><a href="/collections/plants-garden" style="color: #333; text-decoration: none;">🌿 Plants & Garden</a></li>
        <li style="padding: 8px 0;"><a href="/collections/health-wellness-1" style="color: #333; text-decoration: none;">🧘 Health & Wellness</a></li>
        <li style="padding: 8px 0;"><a href="/collections/catering-food" style="color: #333; text-decoration: none;">🍛 Catering & Food</a></li>
      </ul>
    </div>

    <div style="background: #f8f8f8; padding: 20px; border-radius: 10px;">
      <h2 style="color: #8B4513; border-bottom: 2px solid #FF9933; padding-bottom: 10px;">🏪 Shop by Seller</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0;"><a href="/collections/artha-financial-wisdom" style="color: #333; text-decoration: none;">💼 Artha Financial Wisdom</a></li>
        <li style="padding: 8px 0;"><a href="/collections/vidya-college-mentors" style="color: #333; text-decoration: none;">🎓 Vidya College Mentors</a></li>
        <li style="padding: 8px 0;"><a href="/collections/vrindavan-garlands" style="color: #333; text-decoration: none;">💐 Vrindavan Garlands</a></li>
        <li style="padding: 8px 0;"><a href="/collections/govinda-books" style="color: #333; text-decoration: none;">📚 Govinda Books</a></li>
        <li style="padding: 8px 0;"><a href="/collections/deity-seva-store" style="color: #333; text-decoration: none;">🛕 Deity Seva Store</a></li>
        <li style="padding: 8px 0;"><a href="/collections/tulsi-nursery" style="color: #333; text-decoration: none;">🌱 Tulsi Nursery</a></li>
        <li style="padding: 8px 0;"><a href="/collections/ayur-wellness" style="color: #333; text-decoration: none;">🧴 Ayur Wellness</a></li>
      </ul>
    </div>

  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="/collections/all" style="display: inline-block; background: #FF9933; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 10px;">View All Products</a>
    <a href="/apps/marketplace/sellerlist" style="display: inline-block; background: #8B4513; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 10px;">Browse All Sellers</a>
  </div>
</div>
`;

        const createResult = await shopifyRequest('POST', '/pages.json', {
            page: {
                title: 'Browse Marketplace',
                handle: 'browse',
                body_html: browsePageContent,
                published: true
            }
        });

        if (createResult.status === 201 || createResult.status === 200) {
            console.log('✓ Browse page created!');
            console.log('  URL: https://seva-dev.myshopify.com/pages/browse');
        } else {
            console.log('✗ Failed to create:', createResult.status, JSON.stringify(createResult.data));
        }
    }
}

main().catch(console.error);
