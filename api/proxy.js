// 使用标准 Node.js 运行时，比 Edge 更稳定
export default async function handler(req, res) {
  // 1. 设置 CORS 头，允许所有跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. 获取 API Key
  const { key } = req.query;
  
  // 4. 硬编码 Google 目标地址
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  try {
    // 5. 转发请求
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    // 6. 返回结果
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Failed', details: error.message });
  }
}
