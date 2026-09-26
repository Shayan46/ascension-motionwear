import storefrontHtml from "../storefront.html?raw";

export async function GET() {
  return new Response(storefrontHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
