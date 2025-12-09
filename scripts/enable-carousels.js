const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;
const THEME_ID = 157097328865;

// Get current template
async function getTemplate() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`,
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
                const data = JSON.parse(body);
                resolve(JSON.parse(data.asset.value));
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// Update template
async function updateTemplate(template) {
    const data = JSON.stringify({
        asset: {
            key: 'templates/index.json',
            value: JSON.stringify(template, null, 2)
        }
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${THEME_ID}/assets.json`,
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
                resolve({ status: res.statusCode, data: JSON.parse(body) });
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Getting current homepage template...');
    const template = await getTemplate();

    // Enable carousel/slider for Featured Categories (collection-list)
    if (template.sections['featured-categories']) {
        console.log('Enabling slider for Shop by Category...');
        template.sections['featured-categories'].settings.swipe_on_mobile = true;
        template.sections['featured-categories'].settings.columns_desktop = 5;
        // collection-list doesn't have desktop slider, but we can reduce columns for carousel feel
    }

    // Enable desktop slider for Featured Products
    if (template.sections['featured-products']) {
        console.log('Enabling slider for Featured Products...');
        template.sections['featured-products'].settings.enable_desktop_slider = true;
        template.sections['featured-products'].settings.swipe_on_mobile = true;
        template.sections['featured-products'].settings.columns_desktop = 4;
        template.sections['featured-products'].settings.products_to_show = 12;
    }

    // Enable swipe for Our Sellers
    if (template.sections['featured-sellers']) {
        console.log('Enabling slider for Our Sellers...');
        template.sections['featured-sellers'].settings.swipe_on_mobile = true;
        template.sections['featured-sellers'].settings.columns_desktop = 4;
    }

    console.log('Updating homepage template...');
    const result = await updateTemplate(template);

    if (result.status === 200) {
        console.log('✓ Successfully enabled carousels!');
    } else {
        console.log('Error:', result.data);
    }
}

main();
