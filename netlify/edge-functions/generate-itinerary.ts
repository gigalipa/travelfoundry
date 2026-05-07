import type { Context } from "@netlify/edge-functions";
import type { TripData } from '../../src/data/itinerary';

type TripFormData = {
  origin?: string;
  destination?: string;
  conditions?: string;
  tripType?: string;
  travelers?: string | number;
  budget?: string;
  arrival?: string;
  departure?: string;
  interests?: string[] | string;
};

type GeminiCandidate = {
  content?: {
    parts?: { text?: string }[];
  };
  finishReason?: string;
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type OpenAiResponse = {
  choices?: {
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }[];
  error?: {
    message?: string;
  };
};

type JsonSchema = {
  type: 'object' | 'array' | 'string' | 'number' | 'integer';
  description?: string;
  enum?: string[];
  format?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  propertyOrdering?: string[];
  items?: JsonSchema;
  minItems?: number;
};

class HttpError extends Error {
  statusCode: number;
  retryable: boolean;

  constructor(message: string, statusCode = 500, retryable = false) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

type Provider = 'gemini' | 'openai';

type ItineraryModel = {
  provider: Provider;
  model: string;
};

const DEFAULT_PRIMARY_MODEL: ItineraryModel = { provider: 'gemini', model: 'gemini-2.5-flash' };
const DEFAULT_FALLBACK_MODELS: ItineraryModel[] = [
  { provider: 'gemini', model: 'gemini-flash-latest' },
  { provider: 'gemini', model: 'gemini-3.1-flash-lite' },
];
const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);
const DEFAULT_GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MAX_OUTPUT_TOKENS = 8192;

const activitySchema: JsonSchema = {
  type: 'object',
  properties: {
    time: { type: 'string', description: 'Hora de inicio en formato HH:MM.' },
    title: { type: 'string' },
    location: { type: 'string' },
    notes: { type: 'string' },
    price: { type: 'string' },
    category: {
      type: 'string',
      enum: ['museum', 'food', 'transport', 'sightseeing', 'nature', 'shopping', 'relax'],
    },
    funFact: { type: 'string' },
    tips: { type: 'array', items: { type: 'string' }, minItems: 1 },
  },
  required: ['time', 'title', 'location', 'notes', 'price', 'category', 'funFact', 'tips'],
  propertyOrdering: ['time', 'title', 'location', 'notes', 'price', 'category', 'funFact', 'tips'],
};

const daySchema: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    date: { type: 'string', format: 'date' },
    label: { type: 'string' },
    dayNumber: { type: 'integer' },
    weather: {
      type: 'object',
      properties: {
        temp: { type: 'number' },
        condition: { type: 'string', enum: ['sunny', 'cloudy', 'partly-cloudy', 'rainy'] },
      },
      required: ['temp', 'condition'],
      propertyOrdering: ['temp', 'condition'],
    },
    expenses: {
      type: 'object',
      properties: {
        transport: { type: 'number' },
        food: { type: 'number' },
        tickets: { type: 'number' },
        other: { type: 'number' },
      },
      required: ['transport', 'food', 'tickets', 'other'],
      propertyOrdering: ['transport', 'food', 'tickets', 'other'],
    },
    activities: { type: 'array', items: activitySchema, minItems: 1 },
  },
  required: ['id', 'date', 'label', 'dayNumber', 'weather', 'expenses', 'activities'],
  propertyOrdering: ['id', 'date', 'label', 'dayNumber', 'weather', 'expenses', 'activities'],
};

const itineraryResponseSchema: JsonSchema = {
  type: 'object',
  properties: {
    tripName: { type: 'string' },
    destination: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
    days: { type: 'array', items: daySchema, minItems: 1 },
    tips: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string', enum: ['transport', 'food', 'reservations', 'money', 'general'] },
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
        },
        required: ['id', 'category', 'title', 'description', 'icon'],
        propertyOrdering: ['id', 'category', 'title', 'description', 'icon'],
      },
    },
    secrets: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
          location: { type: 'string' },
          dayId: { type: 'string' },
        },
        required: ['id', 'name', 'description', 'image', 'location', 'dayId'],
        propertyOrdering: ['id', 'name', 'description', 'image', 'location', 'dayId'],
      },
    },
  },
  required: ['tripName', 'destination', 'startDate', 'endDate', 'days', 'tips', 'secrets'],
  propertyOrdering: ['tripName', 'destination', 'startDate', 'endDate', 'days', 'tips', 'secrets'],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function jsonResponse(body: unknown, statusCode = 200) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function getApiKey() {
  return Netlify.env.get('GEMINI_API_KEY') || Netlify.env.get('GOOGLE_API_KEY') || Netlify.env.get('VITE_GEMINI_API_KEY') || '';
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function parseConfiguredModel(value: string): ItineraryModel {
  const [providerPrefix, ...modelParts] = value.split(':');
  const model = modelParts.length ? modelParts.join(':') : value;

  if (providerPrefix === 'openai' || model.startsWith('gpt-') || model.startsWith('o')) {
    return { provider: 'openai', model };
  }

  return { provider: 'gemini', model };
}

function getConfiguredModels() {
  const configuredPrimary = (Netlify.env.get('AI_ITINERARY_MODEL') || Netlify.env.get('GEMINI_MODEL'))?.trim();
  const configuredFallbacks = (Netlify.env.get('AI_ITINERARY_FALLBACK_MODELS') || Netlify.env.get('GEMINI_FALLBACK_MODELS'))
    ?.split(',')
    .map((model: string) => model.trim())
    .filter(Boolean)
    .map(parseConfiguredModel);

  const models = [
    configuredPrimary ? parseConfiguredModel(configuredPrimary) : DEFAULT_PRIMARY_MODEL,
    ...(configuredFallbacks?.length ? configuredFallbacks : DEFAULT_FALLBACK_MODELS),
    ...DEFAULT_FALLBACK_MODELS.filter((fallback) => fallback.provider === 'openai'),
  ];

  const uniqueModels = new Map<string, ItineraryModel>();
  for (const model of models) {
    uniqueModels.set(`${model.provider}:${model.model}`, model);
  }

  return [...uniqueModels.values()];
}

function stringifyInterests(interests: TripFormData['interests']) {
  if (Array.isArray(interests)) return interests.filter(Boolean).join(', ');
  return interests || 'No especificados';
}

function detectLanguage(formData: TripFormData) {
  const combinedText = [
    formData.origin,
    formData.destination,
    formData.conditions,
    formData.tripType,
    formData.budget,
    stringifyInterests(formData.interests),
  ]
    .filter(Boolean)
    .join(' ');

  return /[áéíóúñü¿¡]/i.test(combinedText) ? 'español' : 'english';
}

function buildPrompt(formData: TripFormData) {
  const language = detectLanguage(formData);

  return `
Genera un itinerario detallado y creativo para el siguiente viaje:
- Origen: ${formData.origin || 'No especificado'}
- Destino: ${formData.destination || 'No especificado'}
- Estilo/Condiciones: ${formData.conditions || 'No especificado'}
- Tipo: ${formData.tripType || 'No especificado'}
- Viajeros: ${formData.travelers || 'No especificado'}
- Presupuesto: ${formData.budget || 'No especificado'}
- Fechas: ${formData.arrival || 'No especificado'} hasta ${formData.departure || 'No especificado'}
- Intereses: ${stringifyInterests(formData.interests)}

REQUISITOS OBLIGATORIOS:
1. Responde completamente en ${language}.
2. Devuelve solo JSON válido, sin markdown ni texto introductorio o adicional.
3. Incluye costos realistas por día y actividad en la moneda local del destino.
4. Cada día debe tener actividades con horarios HH:MM, ubicación, notas, categoría, dato curioso y consejos.
5. Usa este esquema exacto:
{
  "tripName": string,
  "destination": string,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "days": [
    {
      "id": string,
      "date": "YYYY-MM-DD",
      "label": string,
      "dayNumber": number,
      "weather": { "temp": number, "condition": "sunny|cloudy|partly-cloudy|rainy" },
      "expenses": { "transport": number, "food": number, "tickets": number, "other": number },
      "activities": [
        {
          "time": "HH:MM",
          "title": string,
          "location": string,
          "notes": string,
          "price": string,
          "category": "museum|food|transport|sightseeing|nature|shopping|relax",
          "funFact": string,
          "tips": string[]
        }
      ]
    }
  ],
  "tips": [
    { "id": string, "category": "transport|food|reservations|money|general", "title": string, "description": string, "icon": string }
  ],
  "secrets": [
    { "id": string, "name": string, "description": string, "image": string, "location": string, "dayId": string }
  ]
}
`.trim();
}

function extractText(data: GeminiResponse) {
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
}

function extractJsonObject(text: string) {
  const withoutFence = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const firstBrace = withoutFence.indexOf('{');
  if (firstBrace < 0) return withoutFence;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < withoutFence.length; index += 1) {
    const char = withoutFence[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) return withoutFence.slice(firstBrace, index + 1);
  }

  throw new HttpError('El proveedor de IA devolvió JSON incompleto para el itinerario.', 502, true);
}

function parseItineraryJson(text: string): TripData {
  let parsed: TripData;

  try {
    parsed = JSON.parse(extractJsonObject(text)) as TripData;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError('El proveedor de IA devolvió una respuesta que no era JSON válido.', 502, true);
  }

  if (
    !parsed ||
    typeof parsed.tripName !== 'string' ||
    typeof parsed.destination !== 'string' ||
    !Array.isArray(parsed.days) ||
    parsed.days.length === 0
  ) {
    throw new HttpError('El proveedor de IA devolvió un itinerario incompleto.', 502, true);
  }

  return parsed;
}

function getGeminiEndpoint(model: string) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    throw new HttpError('Gemini no está configurado para generar itinerarios.', 500, false);
  }

  const baseUrl = trimTrailingSlash(Netlify.env.get('GOOGLE_GEMINI_BASE_URL') || DEFAULT_GEMINI_API_BASE_URL);
  return `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function getOpenAiEndpoint() {
  if (Netlify.env.get('OPENAI_BASE_URL') && Netlify.env.get('OPENAI_API_KEY')) {
    return {
      apiKey: Netlify.env.get('OPENAI_API_KEY'),
      url: `${trimTrailingSlash(Netlify.env.get('OPENAI_BASE_URL') as string)}/chat/completions`,
    };
  }

  if (Netlify.env.get('NETLIFY_AI_GATEWAY_BASE_URL') && Netlify.env.get('NETLIFY_AI_GATEWAY_KEY')) {
    return {
      apiKey: Netlify.env.get('NETLIFY_AI_GATEWAY_KEY'),
      url: `${trimTrailingSlash(Netlify.env.get('NETLIFY_AI_GATEWAY_BASE_URL') as string)}/openai/v1/chat/completions`,
    };
  }

  if (Netlify.env.get('OPENAI_API_KEY')) {
    return {
      apiKey: Netlify.env.get('OPENAI_API_KEY'),
      url: 'https://api.openai.com/v1/chat/completions',
    };
  }

  throw new HttpError('OpenAI no está configurado para generar itinerarios.', 500, false);
}

function toOpenAiJsonSchema(schema: JsonSchema): Record<string, unknown> {
  const converted: Record<string, unknown> = { type: schema.type };

  if (schema.description) converted.description = schema.description;
  if (schema.enum) converted.enum = schema.enum;
  if (schema.required) converted.required = schema.required;
  if (schema.items) converted.items = toOpenAiJsonSchema(schema.items);

  if (schema.properties) {
    converted.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, toOpenAiJsonSchema(value)]),
    );
  }

  if (schema.type === 'object') {
    converted.additionalProperties = false;
  }

  return converted;
}

async function callGemini(model: string, prompt: string) {
  const response = await fetch(getGeminiEndpoint(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              'Eres un planificador de viajes experto. Devuelves únicamente JSON válido y respetas exactamente el esquema solicitado.',
          },
        ],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    console.error('Gemini API Error Payload:', JSON.stringify(data.error));
    const message = data.error?.message || `Gemini respondió con HTTP ${response.status}.`;
    throw new HttpError(message, response.status, RETRYABLE_STATUS_CODES.has(response.status));
  }

  const text = extractText(data);
  if (!text) {
    throw new HttpError('Gemini no devolvió contenido para el itinerario.', 502, true);
  }

  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    throw new HttpError('Gemini cortó la respuesta antes de completar el JSON.', 502, true);
  }

  return parseItineraryJson(text);
}

async function callOpenAi(model: string, prompt: string) {
  const endpoint = getOpenAiEndpoint();
  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${endpoint.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Eres un planificador de viajes experto. Devuelves únicamente JSON válido y respetas exactamente el esquema solicitado.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'itinerary_response',
          strict: true,
          schema: toOpenAiJsonSchema(itineraryResponseSchema),
        },
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as OpenAiResponse;

  if (!response.ok) {
    const message = data.error?.message || `OpenAI respondió con HTTP ${response.status}.`;
    throw new HttpError(message, response.status, RETRYABLE_STATUS_CODES.has(response.status));
  }

  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) {
    throw new HttpError('OpenAI no devolvió contenido para el itinerario.', 502, true);
  }

  if (data.choices?.[0]?.finish_reason === 'length') {
    throw new HttpError('OpenAI cortó la respuesta antes de completar el JSON.', 502, true);
  }

  return parseItineraryJson(text);
}

function callProvider(model: ItineraryModel, prompt: string) {
  if (model.provider === 'openai') {
    return callOpenAi(model.model, prompt);
  }

  return callGemini(model.model, prompt);
}

function isProviderConfigurationError(error: unknown) {
  return error instanceof HttpError && !error.retryable && error.message.includes('no está configurado');
}

async function generateWithRetries(prompt: string) {
  const models = getConfiguredModels();
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const model of models) {
      try {
        return await callProvider(model, prompt);
      } catch (error) {
        if (!lastError || !isProviderConfigurationError(error)) {
          lastError = error;
        }

        if (isProviderConfigurationError(error)) continue;

        const isRetryable = error instanceof HttpError && error.retryable;
        if (!isRetryable) continue;
      }
    }
    await sleep(450 * 2 ** attempt);
  }

  if (lastError instanceof HttpError) {
    throw lastError;
  }

  throw new HttpError('No se pudo generar un itinerario válido con los modelos disponibles.', 502, false);
}

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 204);
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405);
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as { formData?: TripFormData };
    if (!payload.formData?.destination) {
      return jsonResponse({ error: 'El destino es obligatorio para generar el itinerario.' }, 400);
    }

    const itinerary = await generateWithRetries(buildPrompt(payload.formData));
    return jsonResponse({ itinerary });
  } catch (error) {
    console.error('Itinerary generation failed:', error instanceof Error ? error.message : error);

    if (error instanceof HttpError) {
      const message = error.retryable
        ? 'El proveedor de IA no está disponible temporalmente. Se intentaron modelos de reserva, pero el servicio siguió respondiendo con error.'
        : error.message;

      return jsonResponse({ error: message }, error.statusCode >= 400 ? error.statusCode : 500);
    }

    return jsonResponse({ error: 'No se pudo generar un itinerario válido. Inténtalo de nuevo.' }, 500);
  }
};
