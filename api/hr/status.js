export const config = { runtime: 'edge' };

export default async (req) => {
  // URL Power Automate из переменных окружения
  const FLOW_URL = process.env.FLOW_URL;

  // Обработка CORS-запросов (для браузеров и внешних клиентов)
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

  // Определяем тип запроса
  let body;
  const ct = req.headers.get('content-type') || '';

  if (req.method === 'GET') {
    // Корректная обработка относительного URL (Vercel edge может возвращать только путь)
    const url = req.url.startsWith('http')
      ? req.url
      : `https://${req.headers.get('host')}${req.url}`;
    const q = Object.fromEntries(new URL(url).searchParams);
    body = JSON.stringify(q); // GET → JSON
  } else if (req.method === 'POST') {
    body = await req.text();  // POST → как есть
  } else {
    return new Response('method not allowed', { status: 405 });
  }

  // Отправляем POST-запрос в Power Automate Flow
  const res = await fetch(FLOW_URL, {
    method: 'POST',
    headers: {
      'content-type': ct.includes('json')
        ? 'application/json'
        : 'application/octet-stream',
    },
    body,
  });

  // Возвращаем ответ обратно клиенту
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'access-control-allow-origin': '*' },
  });
};
