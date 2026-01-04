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
  
  // 2. 硬编码 Google 目标地址 (gemma-3-4b-it)
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    return new Response(JSON.stringify({ error: 'Proxy Failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
