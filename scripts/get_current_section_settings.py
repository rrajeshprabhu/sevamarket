import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get index.json template (homepage sections with their settings)
url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]=templates/index.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    asset = response.json().get('asset', {})
    value = asset.get('value', '')
    print("=== templates/index.json (LIVE from theme) ===")
    print(value)
else:
    print(f"Error getting index.json: {response.status_code}")
    print(response.text)
