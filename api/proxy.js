export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. 获取请求 URL 中的查询参数 (主要是 key)
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('key');

  // 2. [核心修复] 硬编码目标 URL，不再依赖前端传递的路径
  // 这样避免了冒号(:)被转义成 %3A 导致 Google 报错
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('origin');
  headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(targetUrl, {
      method: 'POST', // 强制 POST
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
