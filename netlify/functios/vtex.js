// Netlify serverless function - proxy para VTEX APIs de Walmart CR
exports.handler = async (event) => {
  const { store, query } = event.queryStringParameters || {};

  const domains = {
    maxi: 'www.maxipali.co.cr',
    mas: 'www.masxmenos.cr',
    walmart: 'www.walmart.co.cr',
  };

  const domain = domains[store];
  if (!domain || !query) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Falta store o query' }),
    };
  }

  const url = `https://${domain}/api/catalog_system/pub/products/search?${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SuperPrecioCR/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Upstream error ' + res.status }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
