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

// Our Story page content
const pageContent = `
<div class="our-story-page">

<p><strong>Seva Market began with a simple question:</strong> <em>What if shopping could be an act of service?</em></p>

<p>In Sanskrit, "seva" means selfless service — giving without expecting anything in return. We built Seva Market to bring that spirit into everyday commerce.</p>

<p>We're a community marketplace where artisans, small businesses, and makers sell products that matter. Every purchase supports real families, funds community programs, and keeps money circulating where it's needed most.</p>

<p><strong>No faceless corporations. No anonymous warehouses.</strong></p>

<p>Just people serving people.</p>

<p>Whether you're buying handcrafted goods, spiritual items, homemade foods, or wellness products — you're not just a customer. You're part of a community that believes commerce can be conscious.</p>

<p><strong>Shop with purpose. Support your community.</strong></p>

<hr>

<h2>Why We Exist</h2>

<p><strong>We believe shopping should mean something.</strong></p>

<p>Seva Market is a community-powered marketplace connecting conscious buyers with trusted sellers who share their values.</p>

<p>Big marketplaces prioritize profits over people. Sellers are anonymous. Quality is inconsistent. Money flows to distant shareholders.</p>

<p><strong>We built something different.</strong></p>

<hr>

<h2>How We're Different</h2>

<table style="width:100%; border-collapse: collapse; margin: 20px 0;">
<tr style="background-color: #f5f5f5;">
<th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Traditional Marketplaces</th>
<th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Seva Market</th>
</tr>
<tr>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Anonymous sellers</td>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Know who you're buying from</td>
</tr>
<tr>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Race to the bottom on price</td>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Fair prices, fair wages</td>
</tr>
<tr>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Profits leave the community</td>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Money stays local</td>
</tr>
<tr>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Anything goes</td>
<td style="padding: 12px; border-bottom: 1px solid #ddd;">Curated, quality products</td>
</tr>
</table>

<hr>

<h2>Our Values</h2>

<ul>
<li><strong>Community First</strong> — We exist to serve our sellers and buyers, not shareholders</li>
<li><strong>Trust & Transparency</strong> — Every seller is verified. Every product is real.</li>
<li><strong>Conscious Commerce</strong> — Products that align with mindful living</li>
<li><strong>Seva Spirit</strong> — A portion of every sale supports community causes</li>
</ul>

<hr>

<h2>What Makes Us Different</h2>

<p><strong>For Buyers:</strong> Find products from people who care. Know exactly who you're supporting. Shop without compromise.</p>

<p><strong>For Sellers:</strong> Reach customers who value quality over cheapness. Keep more of what you earn. Be part of a community, not just a platform.</p>

<hr>

<h2>Our Promise</h2>

<ul>
<li>Every seller is a real person, verified by our team</li>
<li>Every product meets our community standards</li>
<li>Every purchase keeps money in the community</li>
</ul>

<hr>

<h2>Where Does the Money Go?</h2>

<p>Seva Market charges a small platform fee to cover operations. But here's the difference: <strong>100% of our net proceeds are donated to community causes.</strong></p>

<p>We support:</p>
<ul>
<li>Food distribution programs</li>
<li>Community education initiatives</li>
<li>Support for artisan families in need</li>
<li>Local temple and ashram programs</li>
</ul>

<p>Every quarter, we publish exactly where the money went. Full transparency. No corporate profits. Just seva.</p>

<hr>

<h2>This Is Just the Beginning</h2>

<p>We started with one community. But the model works for any group that wants commerce with conscience — yoga studios, spiritual centers, cultural organizations, artisan collectives.</p>

<p>If your community wants a marketplace built on trust instead of transactions, we'd love to help.</p>

<hr>

<h2>Join Us</h2>

<p>Whether you're a buyer looking for meaningful products, or a seller wanting to reach conscious consumers — <strong>welcome home.</strong></p>

<div style="text-align: center; margin: 40px 0;">
<h3>Seva Market</h3>
<p><strong>Where every purchase is service.</strong></p>
<p style="margin-top: 20px;">
<a href="/collections/all" style="display: inline-block; padding: 12px 24px; background: #FF9933; color: white; text-decoration: none; border-radius: 4px; margin: 5px;">Shop Now</a>
<a href="/pages/become-a-seller" style="display: inline-block; padding: 12px 24px; background: #FF9933; color: white; text-decoration: none; border-radius: 4px; margin: 5px;">Become a Seller</a>
<a href="/pages/contact" style="display: inline-block; padding: 12px 24px; background: #FF9933; color: white; text-decoration: none; border-radius: 4px; margin: 5px;">Contact Us</a>
</p>
</div>

</div>
`;

// Create page via Shopify API
function createPage(title, handle, bodyHtml) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            page: {
                title: title,
                handle: handle,
                body_html: bodyHtml,
                published: true
            }
        });

        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/pages.json',
            method: 'POST',
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

// Update existing page
function updatePage(pageId, title, bodyHtml) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            page: {
                id: pageId,
                title: title,
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

// Get all pages to check if our-story exists
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

async function main() {
    try {
        console.log('Checking for existing Our Story page...');
        const pagesData = await getPages();

        const existingPage = pagesData.pages?.find(p =>
            p.handle === 'our-story' || p.title.toLowerCase() === 'our story'
        );

        if (existingPage) {
            console.log(`Found existing page (ID: ${existingPage.id}). Updating...`);
            const result = await updatePage(existingPage.id, 'Our Story', pageContent);
            if (result.status === 200) {
                console.log('Successfully updated Our Story page!');
                console.log(`URL: https://${SHOP}/pages/our-story`);
            } else {
                console.log('Update failed:', JSON.stringify(result.data, null, 2));
            }
        } else {
            console.log('Creating new Our Story page...');
            const result = await createPage('Our Story', 'our-story', pageContent);
            if (result.status === 201) {
                console.log('Successfully created Our Story page!');
                console.log(`URL: https://${SHOP}/pages/our-story`);
            } else {
                console.log('Creation failed:', JSON.stringify(result.data, null, 2));
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
