import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get current settings
url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]=config/settings_data.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    asset = response.json().get('asset', {})
    value = asset.get('value', '')

    # Parse the JSON (skip the comment header)
    # Find the start of the actual JSON
    json_start = value.find('{')
    if json_start != -1:
        json_content = value[json_start:]
        settings = json.loads(json_content)

        # Update logo width
        if 'current' in settings:
            settings['current']['logo_width'] = 120

        # Put it back
        put_url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json"
        put_data = {
            "asset": {
                "key": "config/settings_data.json",
                "value": json.dumps(settings, indent=2)
            }
        }

        put_response = requests.put(put_url, headers=headers, json=put_data)

        if put_response.status_code == 200:
            print("Successfully updated logo_width to 120")
        else:
            print(f"Error updating: {put_response.status_code}")
            print(put_response.text)
else:
    print(f"Error fetching settings: {response.status_code}")
