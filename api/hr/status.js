export const config = { runtime: 'edge' };

export default async (req) => {
  const FLOW_URL = process.env.FLOW_URL;
  const SECRET   = process.env.SECRET_TOKEN;

  const token = req.headers.get('x-auth');
  if (!token || token !== SECRET) return new Response('forbidden', { status: 403 });

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type,x-auth',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      },
    });
  }

  let body; const ct = req.headers.get('content-type') || '';
  if (req.method === 'GET') {
    const q = Object.fromEntries(new URL(req.url).searchParams);
    body = JSON.stringify(q);
  } else if (req.method === 'POST') {
    body = await req.text();
  } else {
    return new Response('method not allowed', { status: 405 });
  }

  const res = await fetch(FLOW_URL, {
    method: 'POST',
    headers: { 'content-type': ct.includes('json') ? 'application/json' : 'application/octet-stream' },
    body
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'access-control-allow-origin': '*' }
  });
};
