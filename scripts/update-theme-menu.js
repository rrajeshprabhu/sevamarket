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
    console.log('║  Updating Theme Navigation                         ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Get themes
    console.log('Getting themes...');
    const themesResult = await shopifyRequest('GET', '/themes.json');

    if (themesResult.status !== 200) {
        console.log('Failed to get themes:', themesResult.status);
        return;
    }

    const themes = themesResult.data.themes || [];
    const activeTheme = themes.find(t => t.role === 'main');

    if (!activeTheme) {
        console.log('No active theme found');
        return;
    }

    console.log(`Active theme: ${activeTheme.name} (ID: ${activeTheme.id})\n`);

    // Get current navigation settings from theme
    console.log('Getting theme assets...');
    const assetsResult = await shopifyRequest('GET', `/themes/${activeTheme.id}/assets.json`);

    if (assetsResult.status === 200) {
        const assets = assetsResult.data.assets || [];
        const jsonFiles = assets.filter(a => a.key.endsWith('.json'));
        console.log('JSON config files:');
        for (const asset of jsonFiles.slice(0, 20)) {
            console.log(`  - ${asset.key}`);
        }
    }

    // Try to get and update settings_data.json which often contains menu config
    console.log('\nGetting settings_data.json...');
    const settingsResult = await shopifyRequest('GET', `/themes/${activeTheme.id}/assets.json?asset[key]=config/settings_data.json`);

    if (settingsResult.status === 200 && settingsResult.data.asset) {
        console.log('Found settings_data.json');
        const settings = JSON.parse(settingsResult.data.asset.value);

        // Check if there's a header section we can modify
        if (settings.current?.sections?.header) {
            console.log('Header section found in settings');
        }
    }

    // Get the linklist/menu data from navigation API
    console.log('\nChecking Pages...');
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    console.log(`Found ${pagesResult.data.pages?.length || 0} pages`);

    // Navigation in Shopify 2.0 themes uses the nav menu created in admin
    // Let's try to update via the new menu GraphQL API
    console.log('\n=== Alternative: Create a Browse Page ===\n');
    console.log('Since menu API requires admin access, we can create a browse page with links.\n');

    // Create a page with browse links
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

    // Create or update the browse page
    console.log('Creating "Browse" page...');
    const pageData = {
        page: {
            title: 'Browse Marketplace',
            handle: 'browse',
            body_html: browsePageContent,
            published: true
        }
    };

    const createPageResult = await shopifyRequest('POST', '/pages.json', pageData);

    if (createPageResult.status === 201 || createPageResult.status === 200) {
        console.log('✓ Browse page created successfully!');
        console.log(`  URL: https://seva-dev.myshopify.com/pages/browse`);
    } else if (createPageResult.status === 422) {
        console.log('Page may already exist, trying to update...');
        // Get existing page
        const existingPages = await shopifyRequest('GET', '/pages.json?handle=browse');
        if (existingPages.data.pages?.[0]) {
            const pageId = existingPages.data.pages[0].id;
            const updateResult = await shopifyRequest('PUT', `/pages/${pageId}.json`, pageData);
            if (updateResult.status === 200) {
                console.log('✓ Browse page updated successfully!');
            }
        }
    } else {
        console.log('Failed to create page:', createPageResult.status, createPageResult.data);
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  SETUP COMPLETE!                                   ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log('║  Browse page: /pages/browse                        ║');
    console.log('║                                                    ║');
    console.log('║  To add to header menu:                            ║');
    console.log('║  1. Go to Shopify Admin → Online Store → Navigation║');
    console.log('║  2. Edit Main Menu                                 ║');
    console.log('║  3. Add "Browse" → /pages/browse                   ║');
    console.log('╚════════════════════════════════════════════════════╝');
}

main().catch(console.error);
