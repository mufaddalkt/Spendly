'use server';

import { NextResponse } from 'next/server';
import { createChatCompletion, getDefaultProviderId, getProviderConfig } from '@/lib/ai/provider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const providerId = typeof body?.providerId === 'string' && body.providerId.trim() ? body.providerId.trim() : getDefaultProviderId();
    const model = typeof body?.model === 'string' && body.model.trim() ? body.model.trim() : undefined;
    const stream = Boolean(body?.stream);

    if (!prompt) {
      return NextResponse.json({ error: 'Please provide a prompt.' }, { status: 400 });
    }

    const provider = getProviderConfig(providerId);
    if (!provider) {
      return NextResponse.json({ error: `AI provider not found: ${providerId}` }, { status: 400 });
    }

    if (stream) {
      const response = await createChatCompletion(providerId, [
        { role: 'system', content: 'You are Spendly AI, a friendly financial assistant. Help the user with budgeting, spending, savings, and personal finance guidance in simple, actionable terms.' },
        { role: 'user', content: prompt },
      ], { model, stream: true, maxTokens: 500 });

      if ('stream' in response) {
        return new Response(response.stream, {
          status: response.status,
          headers: response.headers,
        });
      }

      throw new Error('AI provider did not return a stream response.');
    }

    const result = await createChatCompletion(providerId, [
      { role: 'system', content: 'You are Spendly AI, a friendly financial assistant. Help the user with budgeting, spending, savings, and personal finance guidance in simple, actionable terms.' },
      { role: 'user', content: prompt },
    ], { model, maxTokens: 500 });

    return NextResponse.json({ message: result.text, providerId: result.providerId, model: result.model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error calling AI service.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
