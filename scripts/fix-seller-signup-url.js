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

// Webkul seller portal URL - Direct signup with shop parameter
const SELLER_PORTAL_URL = 'https://sp-seller.webkul.com/index.php?p=signup&shop=seva-dev.myshopify.com';
const SHOP_NAME = 'seva-dev.myshopify.com';

// Updated page content with clear instructions
const pageContent = `
<div style="max-width: 900px; margin: 0 auto; padding: 10px 20px;">

  <!-- Hero Section with instructions -->
  <div style="text-align: center; background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%); padding: 25px; border-radius: 10px; margin-bottom: 20px; color: white;">
    <p style="font-size: 17px; margin: 0 0 15px 0; opacity: 0.95;">
      Join our community of sellers offering meaningful products to conscious buyers.
    </p>
    <a href="${SELLER_PORTAL_URL}" target="_blank" style="display: inline-block; background: white; color: #FF6600; padding: 12px 35px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Apply Now</a>
    <p style="font-size: 13px; margin: 15px 0 0 0; opacity: 0.95;">
      When prompted, enter: <strong style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 3px;">${SHOP_NAME}</strong>
    </p>
  </div>

  <!-- Quick Benefits + How It Works - Side by Side -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">

    <!-- Quick Benefits -->
    <div style="background: #f9f9f9; padding: 15px 20px; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">Why Sell With Us</h3>
      <div style="font-size: 13px; color: #333; line-height: 1.8;">
        <div>✓ Reach conscious community buyers</div>
        <div>✓ Easy-to-use seller dashboard</div>
        <div>✓ Low commission rates</div>
        <div>✓ Secure payment processing</div>
        <div>✓ Marketing support</div>
      </div>
    </div>

    <!-- How It Works -->
    <div style="background: #f9f9f9; padding: 15px 20px; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">How It Works</h3>
      <div style="font-size: 13px; color: #333; line-height: 1.8;">
        <div><span style="background: #FF9933; color: white; padding: 1px 7px; border-radius: 50%; font-size: 11px; margin-right: 8px;">1</span> Apply - Fill out the form</div>
        <div><span style="background: #FF9933; color: white; padding: 1px 7px; border-radius: 50%; font-size: 11px; margin-right: 8px;">2</span> Review - 1-2 business days</div>
        <div><span style="background: #FF9933; color: white; padding: 1px 7px; border-radius: 50%; font-size: 11px; margin-right: 8px;">3</span> Setup - Add your products</div>
        <div><span style="background: #FF9933; color: white; padding: 1px 7px; border-radius: 50%; font-size: 11px; margin-right: 8px;">4</span> Sell - Go live!</div>
      </div>
    </div>
  </div>

  <!-- Second CTA -->
  <div style="text-align: center; padding: 15px; margin-bottom: 20px; background: #E8F5E9; border-radius: 8px;">
    <a href="${SELLER_PORTAL_URL}" target="_blank" style="display: inline-block; background: #FF9933; color: white; padding: 12px 35px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Apply to Become a Seller</a>
    <p style="color: #555; margin: 10px 0 0 0; font-size: 13px;">
      Shop name to enter: <strong>${SHOP_NAME}</strong>
    </p>
    <p style="color: #666; margin: 8px 0 0 0; font-size: 13px;">
      Questions? <a href="mailto:support@sevasethu.com" style="color: #FF9933;">Contact us</a>
    </p>
  </div>

  <!-- Eligibility Guidelines - Collapsible style, more compact -->
  <details style="background: linear-gradient(135deg, #FFF8E7 0%, #FFF5E0 100%); padding: 15px 20px; border-radius: 8px; border-left: 4px solid #FF9933;">
    <summary style="cursor: pointer; font-weight: bold; color: #8B4513; font-size: 15px; margin-bottom: 10px;">Seller Eligibility Guidelines (click to expand)</summary>

    <div style="margin-top: 15px;">
      <h4 style="color: #2E7D32; margin: 0 0 8px 0; font-size: 14px;">✓ Approved Products & Services</h4>
      <p style="color: #333; margin: 0 0 15px 0; font-size: 13px; line-height: 1.6;">
        Sattvic Foods • Puja Items • Devotional Books & Media • Garlands & Flowers • Tulsi & Sacred Plants • Ayurvedic Products • Traditional Clothing • Yoga/Music Classes • Cruelty-free Products
      </p>

      <h4 style="color: #C62828; margin: 0 0 8px 0; font-size: 14px;">✗ Not Permitted</h4>
      <p style="color: #333; margin: 0; font-size: 13px; line-height: 1.6;">
        Non-vegetarian items • Onion & Garlic • Intoxicants (alcohol, tobacco, caffeine) • Gambling products • Leather & animal products • Inappropriate content
      </p>
    </div>
  </details>

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

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  Fixing Seller Signup URL for Seva Sethu                   ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('Issue: /apps/marketplace/seller/signup returns 404');
        console.log('Fix: Using Webkul hosted seller portal URL instead\n');
        console.log(`Portal URL: ${SELLER_PORTAL_URL}`);
        console.log(`Shop name: ${SHOP_NAME}\n`);

        console.log('Updating "Become a Seller" page...');
        const result = await updatePage(PAGE_ID, pageContent);

        if (result.status === 200) {
            console.log('\n✓ Successfully updated "Become a Seller" page!');
            console.log(`  Page URL: https://sevasethu.com/pages/become-a-seller`);
            console.log(`  Portal URL: ${SELLER_PORTAL_URL}`);
            console.log(`  Shop name: ${SHOP_NAME}\n`);
            console.log('Users will enter the shop name to access signup form.');
        } else {
            console.log('\n✗ Update failed:', JSON.stringify(result.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
