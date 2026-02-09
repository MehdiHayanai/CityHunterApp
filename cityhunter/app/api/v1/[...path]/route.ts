import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1';
const API_KEY = process.env.API_BASE_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Construct the backend URL from the catch-all path
    const path = params.path?.join('/') || '';
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Get the request body if it exists
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const text = await request.text();
        body = text || undefined;
      } catch {
        body = undefined;
      }
    }

    // Forward headers from the original request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Copy authorization header if present (for JWT tokens)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Inject the API key server-side (never exposed to client)
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    // Make the request to the backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s proxy timeout

    try {
        const response = await fetch(backendUrl, {
          method,
          headers,
          body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Handle 204 No Content - cannot have a body
        if (response.status === 204) {
          return new NextResponse(null, {
            status: 204,
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
          });
        }

        // Get response data for other status codes
        const data = await response.text();
        
        // Return the response with the same status code
        return new NextResponse(data, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'application/json',
          },
        });
    } catch (e: any) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
             return NextResponse.json(
                { detail: 'Backend request timed out' },
                { status: 504 }
             );
        }
        throw e;
    }
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { detail: 'Internal proxy error' },
      { status: 500 }
    );
  }
}
