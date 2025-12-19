export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.search; 

  // [修复] 回退到标准模型名称 gemini-1.5-flash，这是最稳定的版本
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent${query}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('origin');
  headers.delete('referer');
  headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
