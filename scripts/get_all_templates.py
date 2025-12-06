import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

templates = [
    "templates/index.json",
    "templates/collection.kitchenware.json",
    "templates/collection.bath-cleaning.json",
    "templates/collection.storage-organization.json"
]

for template in templates:
    url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]={template}"
    response = requests.get(url, headers=headers)

    print(f"\n{'='*60}")
    print(f"=== {template} ===")
    print('='*60)

    if response.status_code == 200:
        asset = response.json().get('asset', {})
        value = asset.get('value', '')
        print(value)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
