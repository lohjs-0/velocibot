import { NextRequest, NextResponse } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

const LIMIT = 30        // requisições máximas
const WINDOW = 60000    // por 60 segundos

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()

  const current = rateLimit.get(ip)

  if (!current || now > current.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW })
    return NextResponse.next()
  }

  if (current.count >= LIMIT) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((current.resetTime - now) / 1000)),
      },
    })
  }

  current.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}