export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // 1. 提取路径
  // 这里的 path 可能会以 "/" 开头，例如 "/v1beta/models/..."
  let path = url.pathname.replace(/^\/api\/proxy/, '');
  
  // [关键修复]：如果 path 开头有斜杠，去掉它
  // 这样后面拼接时就不会出现 "googleapis.com//v1beta" 的情况了
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  
  const query = url.search; 

  // 2. 拼接目标 URL
  // 我们手动加一个 "/"，确保结构是 googleapis.com/v1beta...
  const targetUrl = `https://generativelanguage.googleapis.com/${path}${query}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('origin');
  headers.delete('referer'); // 移除 Referer 头，防止 Google 拒绝请求
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
