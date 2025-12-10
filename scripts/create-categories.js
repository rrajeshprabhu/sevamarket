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

// The 12 Seva Sethu categories
const CATEGORIES = [
    {
        title: "Food & Prasadam",
        body_html: "Sattvic food items, prasadam, and devotional cooking ingredients from our community sellers."
    },
    {
        title: "Clothing & Accessories",
        body_html: "Traditional Vaishnava clothing, dhoti, sarees, kurtas, and devotional accessories."
    },
    {
        title: "Puja Items & Deity Worship",
        body_html: "Items for deity worship including incense, lamps, flowers, and puja accessories."
    },
    {
        title: "Books & Literature",
        body_html: "Spiritual books, scriptures, Bhagavad Gita, Srimad Bhagavatam, and devotional literature."
    },
    {
        title: "Arts & Handicrafts",
        body_html: "Handmade devotional art, paintings, sculptures, and traditional handicrafts."
    },
    {
        title: "Music & Instruments",
        body_html: "Devotional music, kirtana instruments, mridangas, kartals, and harmoniums."
    },
    {
        title: "Health & Wellness",
        body_html: "Ayurvedic products, natural remedies, and wellness items for body and mind."
    },
    {
        title: "Home & Garden",
        body_html: "Tulasi plants, home decor, and items to create a devotional atmosphere at home."
    },
    {
        title: "Education & Courses",
        body_html: "Online courses, workshops, and educational programs on Vedic knowledge."
    },
    {
        title: "Services",
        body_html: "Community services including puja services, astrology, and spiritual guidance."
    },
    {
        title: "Children & Family",
        body_html: "Educational toys, books, and items for children growing up in Krishna consciousness."
    },
    {
        title: "Gifts & Donations",
        body_html: "Gift items and donation options to support temples and community projects."
    }
];

function makeRequest(reqPath, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: reqPath,
            method: method,
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Creating 12 Seva Sethu Category Collections              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        let created = 0;
        
        for (const category of CATEGORIES) {
            console.log(`Creating: ${category.title}...`);
            
            const result = await makeRequest('/admin/api/2024-01/custom_collections.json', 'POST', {
                custom_collection: {
                    title: category.title,
                    body_html: category.body_html,
                    published: true
                }
            });
            
            if (result.status === 201 || result.status === 200) {
                created++;
                console.log(`  ✓ Created (ID: ${result.data.custom_collection.id})`);
            } else {
                console.log(`  ✗ Failed: ${result.status} - ${JSON.stringify(result.data).substring(0, 100)}`);
            }
            
            await sleep(200); // Rate limiting
        }
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`COMPLETE! Created ${created}/${CATEGORIES.length} category collections`);
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        // List all collections
        console.log('Verifying collections...\n');
        const collections = await makeRequest('/admin/api/2024-01/custom_collections.json');
        if (collections.data.custom_collections) {
            collections.data.custom_collections.forEach(c => {
                console.log(`  • ${c.title} (ID: ${c.id})`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
