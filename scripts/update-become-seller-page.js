const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error('Error: SHOPIFY_ACCESS_TOKEN not found in .env file');
    process.exit(1);
}

// Reorganized page - CTA above fold, eligibility guidelines at bottom
const pageContent = `
<div style="max-width: 900px; margin: 0 auto; padding: 20px;">

  <!-- Hero Section with CTA - Above the Fold -->
  <div style="text-align: center; background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%); padding: 40px 30px; border-radius: 12px; margin-bottom: 30px; color: white;">
    <h1 style="margin: 0 0 15px 0; font-size: 32px; color: white;">Become a Seller</h1>
    <p style="font-size: 18px; margin-bottom: 25px; opacity: 0.95;">
      Join our community of sellers offering meaningful products to conscious buyers.
    </p>
    <a href="/apps/marketplace/seller/signup" style="display: inline-block; background: white; color: #FF6600; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Apply Now</a>
  </div>

  <!-- Quick Benefits - 3 Column -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 36px; margin-bottom: 10px;">🛒</div>
      <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">Easy Setup</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Start selling in minutes</p>
    </div>
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 36px; margin-bottom: 10px;">💰</div>
      <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">Low Fees</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Keep more of what you earn</p>
    </div>
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 36px; margin-bottom: 10px;">🤝</div>
      <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">Community</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Reach conscious buyers</p>
    </div>
  </div>

  <!-- How It Works -->
  <div style="background: #f9f9f9; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #333; margin-top: 0; text-align: center;">How It Works</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
      <div>
        <div style="background: #FF9933; color: white; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px;">1</div>
        <p style="color: #333; margin: 0; font-size: 14px;"><strong>Apply</strong><br><span style="color: #666;">Fill out the form</span></p>
      </div>
      <div>
        <div style="background: #FF9933; color: white; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px;">2</div>
        <p style="color: #333; margin: 0; font-size: 14px;"><strong>Review</strong><br><span style="color: #666;">1-2 business days</span></p>
      </div>
      <div>
        <div style="background: #FF9933; color: white; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px;">3</div>
        <p style="color: #333; margin: 0; font-size: 14px;"><strong>Setup</strong><br><span style="color: #666;">Add your products</span></p>
      </div>
      <div>
        <div style="background: #FF9933; color: white; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px;">4</div>
        <p style="color: #333; margin: 0; font-size: 14px;"><strong>Sell</strong><br><span style="color: #666;">Go live!</span></p>
      </div>
    </div>
  </div>

  <!-- Seller Benefits -->
  <div style="background: #E8F5E9; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #2E7D32; margin-top: 0;">Seller Benefits</h2>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
      <div style="color: #333; padding: 8px 0;">✓ Access to conscious community buyers</div>
      <div style="color: #333; padding: 8px 0;">✓ Easy-to-use seller dashboard</div>
      <div style="color: #333; padding: 8px 0;">✓ Secure payment processing</div>
      <div style="color: #333; padding: 8px 0;">✓ Seller support and guidance</div>
      <div style="color: #333; padding: 8px 0;">✓ Marketing support for your products</div>
      <div style="color: #333; padding: 8px 0;">✓ Low commission rates</div>
    </div>
  </div>

  <!-- Second CTA -->
  <div style="text-align: center; padding: 20px; margin-bottom: 30px;">
    <a href="/apps/marketplace/seller/signup" style="display: inline-block; background: #FF9933; color: white; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">Apply to Become a Seller</a>
    <p style="color: #888; margin-top: 15px; font-size: 14px;">
      Questions? <a href="mailto:support@seva-marketplace.com" style="color: #FF9933;">Contact us</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <!-- Eligibility Guidelines - Moved to Bottom -->
  <div style="background: linear-gradient(135deg, #FFF8E7 0%, #FFF5E0 100%); padding: 30px; border-radius: 10px; border-left: 4px solid #FF9933;">
    <h2 style="color: #8B4513; margin-top: 0;">Seller Eligibility Guidelines</h2>
    <p style="color: #555;">To maintain the quality of our marketplace, all products and services should align with our community values:</p>

    <h3 style="color: #2E7D32; margin-top: 20px;">Approved Products & Services</h3>
    <ul style="color: #333; line-height: 1.8;">
      <li><strong>Sattvic Foods</strong> - Pure vegetarian items prepared without onion, garlic, or intoxicants</li>
      <li><strong>Puja Items</strong> - Incense, lamps, deity items, altar accessories</li>
      <li><strong>Devotional Books & Media</strong> - Scriptures, kirtans, lectures, educational materials</li>
      <li><strong>Garlands & Flowers</strong> - Fresh and dried flower malas for worship</li>
      <li><strong>Tulsi & Sacred Plants</strong> - Tulsi plants, seeds, and related items</li>
      <li><strong>Ayurvedic Products</strong> - Natural wellness products, herbs, oils</li>
      <li><strong>Clothing & Accessories</strong> - Traditional wear, japa beads, kanthi malas</li>
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
      <li><strong>Inappropriate Content</strong> - Nothing promoting violence or illicit activities</li>
    </ul>
  </div>

</div>
`;

// Update page
function updatePage(pageId, bodyHtml) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            page: {
                id: pageId,
                body_html: bodyHtml
            }
        });

        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/pages/${pageId}.json`,
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
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
        req.write(data);
        req.end();
    });
}

async function main() {
    try {
        const PAGE_ID = 128205553889; // become-a-seller page ID

        console.log('Updating Become a Seller page...');
        const result = await updatePage(PAGE_ID, pageContent);

        if (result.status === 200) {
            console.log('Successfully updated Become a Seller page!');
            console.log(`URL: https://${SHOP}/pages/become-a-seller`);
        } else {
            console.log('Update failed:', JSON.stringify(result.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
