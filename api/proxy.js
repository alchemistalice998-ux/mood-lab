export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const apiKey = url.searchParams.get('key');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API Key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // [修改] 切换为 gemma-3-4b-it 模型
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${apiKey}`;

  try {
    // 1. 读取前端发送的数据
    const body = await req.json();

    // 2. [关键兼容] 清理可能导致 Gemma 报错的 Gemini 专用字段
    // Gemma 模型不支持 systemInstruction 和 responseMimeType，必须移除
    if (body.systemInstruction) {
      delete body.systemInstruction;
    }
    if (body.generationConfig) {
      delete body.generationConfig.responseMimeType;
      delete body.generationConfig.response_mime_type;
    }

    // 3. 转发“清洗”后的请求给 Google
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
