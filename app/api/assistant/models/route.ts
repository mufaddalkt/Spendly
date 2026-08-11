'use server';

import { NextResponse } from 'next/server';
import { listProviderModels, getProviderConfig } from '@/lib/ai/provider';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providerId = url.searchParams.get('providerId') || undefined;
  if (!providerId) {
    return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
  }

  const provider = getProviderConfig(providerId);
  if (!provider) {
    return NextResponse.json({ error: `Provider not found: ${providerId}` }, { status: 404 });
  }

  try {
    const models = await listProviderModels(providerId);
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to list models';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
