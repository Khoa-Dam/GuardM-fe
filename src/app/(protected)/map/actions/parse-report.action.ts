'use server';

import { auth } from '@/lib/auth';

export interface ParsedReport {
  title: string;
  type: string;
  severity: number;
  description: string;
}

export async function parseReportAction(text: string): Promise<ParsedReport | null> {
  const session = await auth();
  if (!session?.accessToken) return null;

  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  try {
    const res = await fetch(`${apiBase}/ai/parse-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ text }),
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json() as Promise<ParsedReport>;
  } catch {
    return null;
  }
}
