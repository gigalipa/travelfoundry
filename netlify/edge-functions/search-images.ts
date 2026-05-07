import type { Context } from '@netlify/edge-functions';

const jsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const orientation = url.searchParams.get('orientation') || 'landscape';
  const size = url.searchParams.get('size') || 'medium';

  if (!query) {
    return jsonResponse({ error: 'Query is required' }, 400);
  }

  const apiKey = Netlify.env.get('PEXELS_API_KEY');
  if (!apiKey) {
    // Si no hay llave, retornamos null silenciosamente para que los fallbacks actúen en el frontend
    return jsonResponse({ url: null }, 200);
  }

  try {
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}&locale=es-ES`;
    const response = await fetch(pexelsUrl, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Pexels responded with HTTP ${response.status}`);
      return jsonResponse({ url: null }, 200); // Para que funcione el fallback frontend
    }

    const data = await response.json();
    let imageUrl = null;
    
    if (data.photos && data.photos.length > 0) {
      imageUrl = size === 'large' ? data.photos[0].src.large : data.photos[0].src.medium;
    }

    return jsonResponse({ url: imageUrl });
  } catch (error) {
    console.error('Pexels proxy error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
