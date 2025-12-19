export const config = {
  runtime: 'edge', // 使用最快的 Edge 模式
};

export default async function handler(req) {
  const url = new URL(req.url);
  // 提取 /api/proxy 之后的所有路径和参数
  const path = url.pathname.replace(/^\/api\/proxy/, '');
  const query = url.search; 

  const targetUrl = `https://generativelanguage.googleapis.com${path}${query}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
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
    return new Response(JSON.stringify({ error: 'Proxy Error' }), { status: 500 });
  }
}
