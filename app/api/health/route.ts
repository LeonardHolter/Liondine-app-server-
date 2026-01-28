import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Use this to verify the API is running
 */

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Lion Dine Menu API',
    version: '1.0.0'
  });
}
