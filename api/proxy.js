export const config = {
  runtime: 'edge', // 使用最快的 Edge 模式
};

export default async function handler(req) {
  // 1. 获取前端传来的 URL 参数（包含 key）
  const url = new URL(req.url);
  const query = url.search; 

  // 2. [关键] 在代码里写死 Google 的地址
  // 这样就避开了 vercel.json 解析冒号(:)报错的问题
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent${query}`;

  // 3. 清理请求头，避免跨域问题
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('origin');
  headers.delete('referer');
  headers.delete('x-forwarded-for');
  headers.set('Content-Type', 'application/json');

  try {
    // 4. 转发请求给 Google
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
        'Access-Control-Allow-Origin': '*', // 允许跨域
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
