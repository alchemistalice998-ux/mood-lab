export const config = {
  runtime: 'edge', // 显式声明使用 Edge Runtime
};

export default async function handler(req) {
  // 1. 解析 URL 和 查询参数
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('key');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API Key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 2. 硬编码 Google 目标地址 (gemini-1.5-flash)
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${apiKey}`;

  try {
    // 3. 转发请求
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.body, // Edge Runtime 可以直接转发 body stream
    });

    const data = await response.text();
    
    // 4. 返回结果
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 允许跨域
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy Failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
