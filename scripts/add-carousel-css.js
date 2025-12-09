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

// Custom carousel CSS
const carouselCSS = `

/* ===== SEVA MARKET CAROUSEL STYLES ===== */

/* Horizontal scroll carousel for collection lists */
.collection-list-wrapper {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #FF9933 #f0f0f0;
}

.collection-list-wrapper::-webkit-scrollbar {
  height: 6px;
}

.collection-list-wrapper::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.collection-list-wrapper::-webkit-scrollbar-thumb {
  background: #FF9933;
  border-radius: 3px;
}

.collection-list {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 1.5rem;
  padding-bottom: 10px;
}

.collection-list__item {
  flex: 0 0 auto;
  width: 200px;
  scroll-snap-align: start;
}

@media screen and (min-width: 750px) {
  .collection-list__item {
    width: 220px;
  }
}

/* Product grid carousel */
.product-grid--carousel {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1.5rem;
  padding-bottom: 10px;
  -webkit-overflow-scrolling: touch;
}

.product-grid--carousel .grid__item {
  flex: 0 0 auto;
  width: 280px;
  scroll-snap-align: start;
}

/* Slider navigation arrows */
.slider-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.slider-button {
  background: #FF9933;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.slider-button:hover {
  background: #E68A00;
}

.slider-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ===== END SEVA MARKET CAROUSEL STYLES ===== */
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

    // Check if carousel styles already added
    if (css.includes('SEVA MARKET CAROUSEL STYLES')) {
        console.log('Carousel styles already exist. Skipping...');
        return;
    }

    // Append carousel CSS
    css += carouselCSS;

    console.log('Adding carousel CSS...');
    const result = await updateCSS(css);

    if (result.status === 200) {
        console.log('✓ Successfully added carousel CSS!');
    } else {
        console.log('Error:', result.data);
    }
}

main();
