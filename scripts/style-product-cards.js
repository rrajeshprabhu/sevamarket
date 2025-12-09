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

// CSS to make product cards compact like collection cards
const productCardCSS = `

/* ===== SEVA MARKET COMPACT PRODUCT CARDS ===== */

/* Make product cards compact like collection cards */
.product-grid .grid__item {
  max-width: 200px;
}

.card--standard .card__inner {
  border-radius: 8px;
  overflow: hidden;
}

/* Compact card content */
.card__content {
  padding: 8px 10px !important;
}

.card__heading {
  font-size: 13px !important;
  line-height: 1.3 !important;
  margin: 0 !important;
}

.card__heading a {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Compact price */
.price {
  font-size: 14px !important;
  margin-top: 4px !important;
}

.price__container {
  gap: 4px !important;
}

/* Hide extra info for cleaner look */
.card-information .caption,
.card__badge,
.card-information .rating {
  display: none !important;
}

/* Smaller quick add button if visible */
.quick-add {
  padding: 6px !important;
}

.quick-add__submit {
  font-size: 12px !important;
  padding: 8px 12px !important;
}

/* Featured Products section - horizontal scroll like others */
#shopify-section-featured-products .grid,
.featured-collection .grid {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 1rem;
  padding-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #FF9933 #f0f0f0;
}

#shopify-section-featured-products .grid::-webkit-scrollbar,
.featured-collection .grid::-webkit-scrollbar {
  height: 6px;
}

#shopify-section-featured-products .grid::-webkit-scrollbar-track,
.featured-collection .grid::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

#shopify-section-featured-products .grid::-webkit-scrollbar-thumb,
.featured-collection .grid::-webkit-scrollbar-thumb {
  background: #FF9933;
  border-radius: 3px;
}

#shopify-section-featured-products .grid__item,
.featured-collection .grid__item {
  flex: 0 0 180px !important;
  max-width: 180px !important;
  width: 180px !important;
  scroll-snap-align: start;
}

@media screen and (min-width: 750px) {
  #shopify-section-featured-products .grid__item,
  .featured-collection .grid__item {
    flex: 0 0 200px !important;
    max-width: 200px !important;
    width: 200px !important;
  }
}

/* ===== END SEVA MARKET COMPACT PRODUCT CARDS ===== */
`;

async function getCSS() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${THEME_ID}/assets.json?asset[key]=assets/base.css`,
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
                resolve(data.asset.value);
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function updateCSS(css) {
    const data = JSON.stringify({
        asset: {
            key: 'assets/base.css',
            value: css
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
    console.log('Getting current CSS...');
    let css = await getCSS();

    // Check if styles already added
    if (css.includes('SEVA MARKET COMPACT PRODUCT CARDS')) {
        console.log('Compact product card styles already exist. Replacing...');
        // Remove old styles
        css = css.replace(/\/\* ===== SEVA MARKET COMPACT PRODUCT CARDS =====[\s\S]*?===== END SEVA MARKET COMPACT PRODUCT CARDS ===== \*\//g, '');
    }

    // Append new CSS
    css += productCardCSS;

    console.log('Adding compact product card CSS...');
    const result = await updateCSS(css);

    if (result.status === 200) {
        console.log('✓ Successfully styled product cards to match category cards!');
    } else {
        console.log('Error:', result.data);
    }
}

main();
