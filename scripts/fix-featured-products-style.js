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

// Get some product collections to feature
async function getCollections() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/custom_collections.json?limit=20',
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
                resolve(data.custom_collections || []);
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Getting current homepage template...');
    const template = await getTemplate();

    // Replace featured-products with a collection-list style section
    // Use the same format as featured-categories and featured-sellers

    console.log('Changing Featured Products to collection-list style...');

    // Create new featured-products section using collection-list type
    // We'll feature product category collections
    template.sections['featured-products'] = {
        type: 'collection-list',
        blocks: {
            'fp1': {
                type: 'featured_collection',
                settings: { collection: 'puja-items' }
            },
            'fp2': {
                type: 'featured_collection',
                settings: { collection: 'books-media-1' }
            },
            'fp3': {
                type: 'featured_collection',
                settings: { collection: 'garlands-malas' }
            },
            'fp4': {
                type: 'featured_collection',
                settings: { collection: 'health-wellness-1' }
            },
            'fp5': {
                type: 'featured_collection',
                settings: { collection: 'plants-garden' }
            },
            'fp6': {
                type: 'featured_collection',
                settings: { collection: 'catering-food' }
            },
            'fp7': {
                type: 'featured_collection',
                settings: { collection: 'yoga-wellness' }
            },
            'fp8': {
                type: 'featured_collection',
                settings: { collection: 'music-lessons' }
            }
        },
        block_order: ['fp1', 'fp2', 'fp3', 'fp4', 'fp5', 'fp6', 'fp7', 'fp8'],
        settings: {
            title: 'Featured Products',
            heading_size: 'h1',
            image_ratio: 'square',
            columns_desktop: 4,
            color_scheme: 'background-1',
            show_view_all: true,
            columns_mobile: '2',
            swipe_on_mobile: true,
            padding_top: 40,
            padding_bottom: 20
        }
    };

    console.log('Updating homepage template...');
    const result = await updateTemplate(template);

    if (result.status === 200) {
        console.log('✓ Successfully updated Featured Products to match other sections!');
    } else {
        console.log('Error:', result.data);
    }
}

main();
