import { NextRequest, NextResponse } from 'next/server';
import { menuCache } from '@/lib/cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cache Management API
 * GET - View cache stats
 * DELETE - Clear cache
 */

export async function GET(request: NextRequest) {
  const stats = menuCache.getStats();
  
  return NextResponse.json({
    status: 'ok',
    cache: {
      entries: stats.entries,
      keys: stats.keys,
      sizeBytes: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2)
    }
  });
}

export async function DELETE(request: NextRequest) {
  menuCache.clear();
  
  return NextResponse.json({
    status: 'ok',
    message: 'Cache cleared successfully'
  });
}
