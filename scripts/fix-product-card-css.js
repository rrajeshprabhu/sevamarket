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

// CSS to make product cards match collection cards exactly
const fixedCSS = `

/* ===== SEVA MARKET UNIFIED CARD STYLES ===== */

/* Featured Products - match Shop by Category style */
#shopify-section-featured-products .product-grid {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 1rem;
  padding-bottom: 12px;
  scrollbar-width: thin;
  scrollbar-color: #FF9933 #f0f0f0;
}

#shopify-section-featured-products .product-grid::-webkit-scrollbar {
  height: 6px;
}

#shopify-section-featured-products .product-grid::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

#shopify-section-featured-products .product-grid::-webkit-scrollbar-thumb {
  background: #FF9933;
  border-radius: 3px;
}

/* Make product cards same size as collection cards */
#shopify-section-featured-products .product-grid .grid__item {
  flex: 0 0 200px !important;
  max-width: 200px !important;
  width: 200px !important;
  scroll-snap-align: start;
}

/* Compact product card styling */
#shopify-section-featured-products .card-wrapper {
  height: 100%;
}

#shopify-section-featured-products .card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

#shopify-section-featured-products .card__inner {
  border-radius: 8px;
}

/* Make image square and same height as collection images */
#shopify-section-featured-products .card__media,
#shopify-section-featured-products .media {
  aspect-ratio: 1/1 !important;
  height: auto !important;
}

/* Compact card content - minimal like collection cards */
#shopify-section-featured-products .card__content {
  padding: 10px 12px !important;
}

#shopify-section-featured-products .card__heading {
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 1.3 !important;
  margin: 0 !important;
}

/* Style product title like collection title with arrow */
#shopify-section-featured-products .card__heading a {
  color: #bf360c !important;
  text-decoration: none;
}

#shopify-section-featured-products .card__heading a::after {
  content: ' →';
  opacity: 0.7;
}

/* Hide price for cleaner look matching collections */
#shopify-section-featured-products .price,
#shopify-section-featured-products .card-information__wrapper > *:not(.card__heading) {
  display: none !important;
}

/* Hide quick add, badges, etc */
#shopify-section-featured-products .quick-add,
#shopify-section-featured-products .card__badge,
#shopify-section-featured-products .card__information-container {
  display: none !important;
}

/* Hide slider controls */
#shopify-section-featured-products .slider-buttons,
#shopify-section-featured-products .slider-counter {
  display: none !important;
}

/* Responsive */
@media screen and (max-width: 749px) {
  #shopify-section-featured-products .product-grid .grid__item {
    flex: 0 0 160px !important;
    max-width: 160px !important;
    width: 160px !important;
  }
}

/* ===== END SEVA MARKET UNIFIED CARD STYLES ===== */
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

    // Remove old carousel/card styles
    css = css.replace(/\/\* ===== SEVA MARKET CAROUSEL STYLES =====[\s\S]*?===== END SEVA MARKET CAROUSEL STYLES ===== \*\//g, '');
    css = css.replace(/\/\* ===== SEVA MARKET COMPACT PRODUCT CARDS =====[\s\S]*?===== END SEVA MARKET COMPACT PRODUCT CARDS ===== \*\//g, '');
    css = css.replace(/\/\* ===== SEVA MARKET UNIFIED CARD STYLES =====[\s\S]*?===== END SEVA MARKET UNIFIED CARD STYLES ===== \*\//g, '');

    // Add new unified CSS
    css += fixedCSS;

    console.log('Updating CSS with unified card styles...');
    const result = await updateCSS(css);

    if (result.status === 200) {
        console.log('✓ Successfully unified all card styles!');
    } else {
        console.log('Error:', result.data);
    }
}

main();
