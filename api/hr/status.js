export const config = { runtime: 'edge' };

export default async (req) => {
  const FLOW_URL = process.env.FLOW_URL;

  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      },
    });
  }

  let body;
  const ct = req.headers.get('content-type') || '';

  if (req.method === 'GET') {
    // Парсим query-параметры вручную из req.url (без использования new URL())
    const url = new URL(req.url, `https://${req.headers.get('host')}`);
    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    body = JSON.stringify(params);
  } else if (req.method === 'POST') {
    body = await req.text();
  } else {
    return new Response('method not allowed', { status: 405 });
  }

  // Отправка в Power Automate
  const res = await fetch(FLOW_URL, {
    method: 'POST',
    headers: {
      'content-type': ct.includes('json') ? 'application/json' : 'application/octet-stream',
    },
    body,
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'access-control-allow-origin': '*' },
  });
};
