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

// Compact Our Story page - fits more content above the fold
const pageContent = `
<div style="max-width: 1000px; margin: 0 auto; padding: 20px;">

  <!-- Hero Section -->
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #333; margin: 0 0 10px 0; font-size: 28px;">Our Story</h1>
    <p style="font-size: 18px; color: #555; margin: 0; max-width: 700px; margin: 0 auto;">
      <em>What if shopping could be an act of service?</em>
    </p>
  </div>

  <!-- Mission Statement - Compact -->
  <div style="background: linear-gradient(135deg, #FFF8E7 0%, #FFF5E0 100%); padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #FF9933;">
    <p style="margin: 0; color: #333; line-height: 1.7; font-size: 15px;">
      In Sanskrit, <strong>"seva"</strong> means selfless service — giving without expecting anything in return. We built Seva Market to bring that spirit into everyday commerce. We're a community marketplace where artisans, small businesses, and makers sell products that matter. <strong>No faceless corporations. No anonymous warehouses.</strong> Just people serving people.
    </p>
  </div>

  <!-- Two Column: Why We Exist + How We're Different -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">

    <!-- Why We Exist -->
    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h2 style="color: #333; margin: 0 0 12px 0; font-size: 18px;">Why We Exist</h2>
      <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
        Big marketplaces prioritize profits over people. Sellers are anonymous. Quality is inconsistent. Money flows to distant shareholders. <strong>We built something different.</strong>
      </p>
    </div>

    <!-- How We're Different -->
    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h2 style="color: #333; margin: 0 0 12px 0; font-size: 18px;">How We're Different</h2>
      <table style="width: 100%; font-size: 13px; color: #333;">
        <tr><td style="padding: 4px 0;">❌ Anonymous sellers</td><td style="padding: 4px 0;">✓ Know who you're buying from</td></tr>
        <tr><td style="padding: 4px 0;">❌ Race to bottom on price</td><td style="padding: 4px 0;">✓ Fair prices, fair wages</td></tr>
        <tr><td style="padding: 4px 0;">❌ Profits leave community</td><td style="padding: 4px 0;">✓ Money stays local</td></tr>
      </table>
    </div>
  </div>

  <!-- Our Values - Horizontal -->
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
    <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 5px;">🤝</div>
      <strong style="font-size: 13px; color: #2E7D32;">Community First</strong>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #555;">Serve sellers & buyers, not shareholders</p>
    </div>
    <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 5px;">🔍</div>
      <strong style="font-size: 13px; color: #1565C0;">Trust & Transparency</strong>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #555;">Every seller verified. Every product real.</p>
    </div>
    <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 5px;">🧘</div>
      <strong style="font-size: 13px; color: #E65100;">Conscious Commerce</strong>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #555;">Products for mindful living</p>
    </div>
    <div style="background: #FCE4EC; padding: 15px; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 5px;">💝</div>
      <strong style="font-size: 13px; color: #C2185B;">Seva Spirit</strong>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #555;">Every sale supports community causes</p>
    </div>
  </div>

  <!-- For Buyers / For Sellers - Side by Side -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div style="border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">For Buyers</h3>
      <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Find products from people who care. Know exactly who you're supporting. Shop without compromise.</p>
    </div>
    <div style="border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">For Sellers</h3>
      <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Reach customers who value quality over cheapness. Keep more of what you earn. Be part of a community.</p>
    </div>
  </div>

  <!-- Where Does the Money Go -->
  <div style="background: #E8F5E9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h2 style="color: #2E7D32; margin: 0 0 10px 0; font-size: 18px;">Where Does the Money Go?</h2>
    <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
      <strong>100% of our net proceeds are donated to community causes:</strong>
    </p>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 13px; color: #333;">
      <div>🍲 Food distribution</div>
      <div>📚 Community education</div>
      <div>🤲 Artisan family support</div>
      <div>🛕 Local temple programs</div>
    </div>
    <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Every quarter, we publish exactly where the money went. Full transparency. No corporate profits. Just seva.</p>
  </div>

  <!-- CTA -->
  <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%); border-radius: 10px;">
    <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">Where every purchase is service.</h3>
    <a href="/collections/all" style="display: inline-block; background: white; color: #FF6600; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 0 8px;">Shop Now</a>
    <a href="/pages/become-a-seller" style="display: inline-block; background: transparent; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; border: 2px solid white; margin: 0 8px;">Become a Seller</a>
  </div>

</div>
`;

// Get pages to find our-story page ID
function getPages() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/pages.json',
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

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
        console.log('Finding Our Story page...');
        const pagesData = await getPages();
        const page = pagesData.pages?.find(p => p.handle === 'our-story');

        if (!page) {
            console.log('Our Story page not found!');
            return;
        }

        console.log(`Found page ID: ${page.id}. Updating...`);
        const result = await updatePage(page.id, pageContent);

        if (result.status === 200) {
            console.log('Successfully updated Our Story page!');
            console.log(`URL: https://${SHOP}/pages/our-story`);
        } else {
            console.log('Update failed:', JSON.stringify(result.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
