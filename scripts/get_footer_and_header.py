import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get list of all assets to find footer related files
url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    assets = response.json().get('assets', [])
    print("=== Footer and Header related files ===")
    for asset in assets:
        key = asset.get('key', '')
        if 'footer' in key.lower() or 'header' in key.lower():
            print(f"  {key}")
else:
    print(f"Error: {response.status_code}")

# Get collection templates to see current banner settings
print("\n\n=== Collection Templates (live) ===")
templates = [
    "templates/collection.kitchenware.json",
    "templates/collection.bath-cleaning.json",
    "templates/collection.storage-organization.json"
]

for template in templates:
    url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]={template}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        asset = response.json().get('asset', {})
        value = asset.get('value', '')
        print(f"\n--- {template} ---")
        print(value)
