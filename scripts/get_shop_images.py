import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

graphql_url = f"https://{SHOP}/admin/api/2024-01/graphql.json"

# Query for files/images
query = """
{
  files(first: 50, query: "media_type:IMAGE") {
    edges {
      node {
        ... on MediaImage {
          id
          image {
            url
            altText
          }
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

print("Shop Images:")
print(json.dumps(response.json(), indent=2))
