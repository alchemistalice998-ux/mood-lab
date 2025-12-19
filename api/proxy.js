// 这是一个运行在 Vercel 边缘节点的代码，专门负责转发 Google API
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // 1. 提取请求路径，去掉 /api/proxy 前缀
  // 例如: /api/proxy/v1beta/models/... -> /v1beta/models/...
  const path = url.pathname.replace(/^\/api\/proxy/, '');
  const query = url.search; 

  // 2. 拼接真实的 Google API 地址
  const targetUrl = `https://generativelanguage.googleapis.com${path}${query}`;

  // 3. 处理请求头，避免跨域和 Host 冲突
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('origin');
  headers.set('Content-Type', 'application/json');

  try {
    // 4. 发起转发请求
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    const data = await response.text();
    
    // 5. 返回结果给前端
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 允许所有跨域
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
