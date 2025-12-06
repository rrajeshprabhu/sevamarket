import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
THEME_ID = "186266124659"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get index.json template
url = f"https://{SHOP}/admin/api/2024-01/themes/{THEME_ID}/assets.json?asset[key]=templates/index.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    asset = response.json().get('asset', {})
    value = asset.get('value', '')
    print("=== templates/index.json ===")
    print(value)
else:
    print(f"Error getting index.json: {response.status_code}")

print("\n\n")

# Get list of files (shop images)
files_url = f"https://{SHOP}/admin/api/2024-01/files.json?limit=50"
files_response = requests.get(files_url, headers=headers)

if files_response.status_code == 200:
    files = files_response.json().get('files', [])
    print("=== Shop Files/Images ===")
    for f in files:
        print(f"  - {f.get('key', 'N/A')}: {f.get('preview', {}).get('image', {}).get('src', 'N/A')}")
else:
    print(f"Error getting files: {files_response.status_code}")
    print(files_response.text)
