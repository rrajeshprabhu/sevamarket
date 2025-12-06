import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Try using GraphQL to get and update navigation
graphql_url = f"https://{SHOP}/admin/api/2024-01/graphql.json"

# First, let's query for all menus
query = """
{
  menus(first: 10) {
    edges {
      node {
        id
        title
        handle
        items {
          id
          title
          url
        }
      }
    }
  }
}
"""

response = requests.post(
    graphql_url,
    headers=headers,
    json={"query": query}
)

print("All menus:")
print(json.dumps(response.json(), indent=2))
