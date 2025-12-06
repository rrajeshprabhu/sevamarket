import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get current settings_data.json
url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]=config/settings_data.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    asset = response.json().get('asset', {})
    value = asset.get('value', '')

    # Find the start of the actual JSON
    json_start = value.find('{')
    if json_start != -1:
        json_content = value[json_start:]
        settings = json.loads(json_content)
        print("Current settings_data.json:")
        print(json.dumps(settings, indent=2))
else:
    print(f"Error: {response.status_code}")
    print(response.text)
