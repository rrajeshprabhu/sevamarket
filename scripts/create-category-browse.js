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

// Category to Sellers mapping
const categoryTree = {
    'Financial Services': {
        sellers: ['Artha Financial Wisdom', 'Kasam Realty'],
        collectionHandle: 'financial-services'
    },
    'Education Services': {
        sellers: ['Vidya College Mentors'],
        collectionHandle: 'education-services'
    },
    'Music & Lessons': {
        sellers: ['Radha Sangeet Music Academy'],
        collectionHandle: 'music-lessons'
    },
    'Yoga & Wellness': {
        sellers: ['Shanti Yoga Studio'],
        collectionHandle: 'yoga-wellness'
    },
    'Health & Wellness': {
        sellers: ['Ayur Wellness'],
        collectionHandle: 'health-wellness-1'
    },
    'Books & Media': {
        sellers: ['Govinda Books'],
        collectionHandle: 'books-media-1'
    },
    'Puja & Deity Items': {
        sellers: ['Deity Seva Store'],
        collectionHandle: 'puja-items'
    },
    'Garlands & Malas': {
        sellers: ['Vrindavan Garlands'],
        collectionHandle: 'garlands-malas'
    },
    'Plants & Garden': {
        sellers: ['Tulsi Nursery'],
        collectionHandle: 'plants-garden'
    },
    'Food & Catering': {
        sellers: ["Govinda's Catering", 'Prabhu Pizza'],
        collectionHandle: 'catering-food'
    }
};

// Seller to collection handle mapping
const sellerHandles = {
    'Artha Financial Wisdom': 'artha-financial-wisdom',
    'Kasam Realty': 'kasam-realty',
    'Vidya College Mentors': 'vidya-college-mentors',
    'Radha Sangeet Music Academy': 'radha-sangeet-music-academy',
    'Shanti Yoga Studio': 'shanti-yoga-studio',
    'Ayur Wellness': 'ayur-wellness',
    'Govinda Books': 'govinda-books',
    'Deity Seva Store': 'deity-seva-store',
    'Vrindavan Garlands': 'vrindavan-garlands',
    'Tulsi Nursery': 'tulsi-nursery',
    "Govinda's Catering": 'govindas-catering',
    'Prabhu Pizza': 'prabhu-pizza'
};

async function main() {
    console.log('=== Creating Category-Based Browse Page ===\n');

    // Build the HTML
    let categoryHtml = '';

    for (const [category, info] of Object.entries(categoryTree)) {
        categoryHtml += `
    <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <h3 style="color: #8B4513; margin: 0 0 15px 0; border-bottom: 2px solid #FF9933; padding-bottom: 8px;">
        <a href="/collections/${info.collectionHandle}" style="color: #8B4513; text-decoration: none;">${category}</a>
      </h3>
      <div style="padding-left: 15px;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Sellers in this category:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">`;

        for (const seller of info.sellers) {
            const handle = sellerHandles[seller];
            categoryHtml += `
          <li style="padding: 5px 0;"><a href="/collections/${handle}" style="color: #333; text-decoration: none;">→ ${seller}</a></li>`;
        }

        categoryHtml += `
        </ul>
      </div>
    </div>`;
    }

    const fullContent = `
<div class="browse-container" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
  <p style="text-align: center; font-size: 18px; color: #666; margin-bottom: 30px;">Discover products and services from our temple community vendors</p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px;">
${categoryHtml}
  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="/collections/all" style="display: inline-block; background: #FF9933; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 10px;">View All Products</a>
  </div>
</div>
`;

    // Get the browse page
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const browsePage = pagesResult.data.pages.find(p => p.handle === 'browse');

    if (!browsePage) {
        console.log('Browse page not found!');
        return;
    }

    // Update the page
    const updateResult = await shopifyRequest('PUT', `/pages/${browsePage.id}.json`, {
        page: {
            id: browsePage.id,
            body_html: fullContent
        }
    });

    if (updateResult.status === 200) {
        console.log('✓ Browse page updated with category tree!');
        console.log('\nCategories with their sellers:');
        for (const [category, info] of Object.entries(categoryTree)) {
            console.log(`\n${category}:`);
            for (const seller of info.sellers) {
                console.log(`  → ${seller}`);
            }
        }
    } else {
        console.log('Failed:', updateResult.status, JSON.stringify(updateResult.data));
    }
}

main().catch(console.error);
