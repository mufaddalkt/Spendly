'use server';

import { NextResponse } from 'next/server';
import { getDefaultProviderId, getProviderConfigs } from '@/lib/ai/provider';

export async function GET() {
  const providers = getProviderConfigs().map((provider) => ({
    id: provider.id,
    name: provider.name,
    model: provider.model,
    protocol: provider.protocol,
  }));
  return NextResponse.json({ providers, defaultProviderId: getDefaultProviderId() });
}
