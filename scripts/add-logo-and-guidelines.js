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
    console.log('=== Updating Become a Seller Page with Guidelines ===\n');

    // Get the become-a-seller page
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const sellerPage = pagesResult.data.pages.find(p => p.handle === 'become-a-seller');

    if (!sellerPage) {
        console.log('Become a Seller page not found!');
        return;
    }

    // New content with eligibility guidelines
    const newContent = `
<div style="max-width: 900px; margin: 0 auto; padding: 20px;">

  <p style="font-size: 18px; color: #666; text-align: center; margin-bottom: 30px;">
    Join our community of sellers offering sacred products and services to devotees worldwide.
  </p>

  <div style="background: linear-gradient(135deg, #FFF8E7 0%, #FFF5E0 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #FF9933;">
    <h2 style="color: #8B4513; margin-top: 0;">Seller Eligibility Guidelines</h2>
    <p style="color: #555;">To maintain the sanctity of our marketplace, all products and services must align with Vaishnava principles:</p>

    <h3 style="color: #2E7D32; margin-top: 20px;">Approved Products & Services</h3>
    <ul style="color: #333; line-height: 1.8;">
      <li><strong>Sattvic Foods</strong> - Pure vegetarian items prepared without onion, garlic, or intoxicants</li>
      <li><strong>Puja Items</strong> - Incense, lamps, deity items, altar accessories</li>
      <li><strong>Devotional Books & Media</strong> - Scriptures, kirtans, lectures, educational materials</li>
      <li><strong>Garlands & Flowers</strong> - Fresh and dried flower malas for deity worship</li>
      <li><strong>Tulsi & Sacred Plants</strong> - Tulsi plants, seeds, and related items</li>
      <li><strong>Ayurvedic Products</strong> - Natural wellness products, herbs, oils</li>
      <li><strong>Clothing & Accessories</strong> - Traditional Indian wear, japa beads, kanthi malas</li>
      <li><strong>Services</strong> - Music lessons, yoga classes, spiritual counseling, education</li>
      <li><strong>Ahimsa Products</strong> - Cruelty-free, non-violent products only</li>
    </ul>

    <h3 style="color: #C62828; margin-top: 25px;">Not Permitted</h3>
    <ul style="color: #333; line-height: 1.8;">
      <li><strong>Non-Vegetarian Items</strong> - No meat, fish, eggs, or products containing these</li>
      <li><strong>Onion & Garlic</strong> - No products containing onion or garlic</li>
      <li><strong>Intoxicants</strong> - No alcohol, tobacco, caffeine (coffee/tea), or recreational drugs</li>
      <li><strong>Gambling Related</strong> - No lottery, betting, or gambling products</li>
      <li><strong>Leather & Animal Products</strong> - No leather goods or products harming animals</li>
      <li><strong>Inappropriate Content</strong> - Nothing promoting violence, illicit activities, or maya</li>
    </ul>
  </div>

  <div style="background: #f5f5f5; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #8B4513; margin-top: 0;">How to Become a Seller</h2>
    <ol style="color: #333; line-height: 2;">
      <li><strong>Apply</strong> - Fill out the seller application form below</li>
      <li><strong>Review</strong> - Our team will review your application (1-2 business days)</li>
      <li><strong>Approval</strong> - Once approved, you'll receive seller dashboard access</li>
      <li><strong>Setup</strong> - Add your products, set prices, and configure shipping</li>
      <li><strong>Start Selling</strong> - Your products go live on the marketplace!</li>
    </ol>
  </div>

  <div style="background: #E8F5E9; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #2E7D32; margin-top: 0;">Seller Benefits</h2>
    <ul style="color: #333; line-height: 1.8; list-style: none; padding: 0;">
      <li>✓ Access to a community of dedicated devotees</li>
      <li>✓ Easy-to-use seller dashboard</li>
      <li>✓ Secure payment processing</li>
      <li>✓ Seller support and guidance</li>
      <li>✓ Marketing support for your products</li>
      <li>✓ Low commission rates</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px;">
    <a href="/apps/marketplace/seller/signup" style="display: inline-block; background: #FF9933; color: white; padding: 18px 40px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 18px;">Apply to Become a Seller</a>
  </div>

  <p style="text-align: center; color: #888; margin-top: 30px; font-size: 14px;">
    Questions? Contact us at <a href="mailto:support@seva-marketplace.com" style="color: #FF9933;">support@seva-marketplace.com</a>
  </p>
</div>
`;

    // Update the page
    const updateResult = await shopifyRequest('PUT', `/pages/${sellerPage.id}.json`, {
        page: {
            id: sellerPage.id,
            title: 'Become a Seller',
            body_html: newContent
        }
    });

    if (updateResult.status === 200) {
        console.log('✓ Become a Seller page updated with guidelines!');
        console.log('\nPage now includes:');
        console.log('  - Seller eligibility guidelines');
        console.log('  - Approved products list (sattvic foods, puja items, etc.)');
        console.log('  - Not permitted items (meat, onion, garlic, caffeine, gambling)');
        console.log('  - How to become a seller steps');
        console.log('  - Seller benefits');
        console.log('  - Apply button');
    } else {
        console.log('Failed:', updateResult.status, JSON.stringify(updateResult.data));
    }
}

main().catch(console.error);
