import { NextRequest, NextResponse } from 'next/server';
import { SEEDED_OBLIGATIONS } from '@/data/seedData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const risk = searchParams.get('risk');
    const search = searchParams.get('search');

    let filtered = [...SEEDED_OBLIGATIONS];

    if (type && type !== 'ALL') {
      filtered = filtered.filter((o) => o.type.toUpperCase() === type.toUpperCase());
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((o) => o.status.toUpperCase() === status.toUpperCase());
    }

    if (risk && risk !== 'ALL') {
      filtered = filtered.filter((o) => o.riskLevel.toUpperCase() === risk.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.counterparty.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      total: filtered.length,
      obligations: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching obligations' }, { status: 500 });
  }
}
