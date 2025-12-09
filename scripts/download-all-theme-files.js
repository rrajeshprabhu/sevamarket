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
const THEME_DIR = path.join(__dirname, '..', 'theme');

// Files to download
const filesToDownload = [
    'config/settings_data.json',
    'config/settings_schema.json',
    'layout/theme.liquid',
    'sections/header.liquid',
    'sections/footer.liquid',
    'sections/header-group.json',
    'sections/footer-group.json',
    'sections/iskcon-hero.liquid',
    'sections/announcement-bar.liquid',
    'sections/featured-collection.liquid',
    'sections/collection-list.liquid',
    'templates/index.json',
    'templates/collection.json',
    'templates/product.json',
    'templates/page.json',
    'templates/page.become-a-seller.json',
    'assets/base.css'
];

async function downloadAsset(key) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(key)}`,
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
                    const data = JSON.parse(body);
                    if (data.asset && data.asset.value) {
                        resolve(data.asset.value);
                    } else if (data.asset && data.asset.public_url) {
                        // Binary file, skip
                        resolve(null);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Downloading latest theme files from Shopify...\n');

    for (const key of filesToDownload) {
        process.stdout.write(`Downloading ${key}... `);

        try {
            const content = await downloadAsset(key);

            if (content) {
                const filePath = path.join(THEME_DIR, key);
                const dir = path.dirname(filePath);

                // Create directory if it doesn't exist
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(filePath, content);
                console.log('✓');
            } else {
                console.log('(skipped - not found or binary)');
            }
        } catch (err) {
            console.log('✗ Error:', err.message);
        }
    }

    console.log('\nDone! Theme files updated locally.');
}

main();
