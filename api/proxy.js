export const config = {
  runtime: 'edge', // 使用 Edge Runtime，速度更快
};

export default async function handler(req) {
  // 1. 解析目标 URL
  // 前端请求地址: /api/proxy/v1beta/models/...
  // 我们需要提取 /api/proxy 之后的部分拼接给 Google
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/proxy/, ''); // 去掉前缀
  const query = url.search; // 保留查询参数 (?key=...)
  
  const targetUrl = `https://generativelanguage.googleapis.com${path}${query}`;

  // 2. 准备请求头
  const headers = new Headers(req.headers);
  // 删除可能引起问题的 Host 头
  headers.delete('host');
  headers.delete('connection');
  // 确保 Content-Type 正确
  headers.set('Content-Type', 'application/json');

  try {
    // 3. 转发请求给 Google
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body, // 直接转发请求体
    });

    // 4. 返回 Google 的响应给前端
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // 允许跨域（虽然 Vercel 同源不需要，但加上更保险）
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