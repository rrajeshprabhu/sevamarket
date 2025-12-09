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
const PAGE_ID = 128205553889;

async function getPage() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/pages/${PAGE_ID}.json`,
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
                resolve(JSON.parse(body));
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const result = await getPage();
    const html = result.page.body_html;

    console.log('Current page content URLs:');

    // Find all hrefs
    const hrefMatches = html.match(/href="([^"]+)"/g);
    if (hrefMatches) {
        hrefMatches.forEach(match => {
            if (match.includes('seller') || match.includes('webkul') || match.includes('signup')) {
                console.log('  ' + match);
            }
        });
    }
}

main().catch(console.error);
