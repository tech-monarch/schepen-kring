import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function POST(req: Request) {
  const { question } = await req.json();

  const answer = `I'm sorry, I don't have enough information to answer that question. Please ask a different question.`;

  return NextResponse.json({ answer });
}

export async function PUT(req: Request) {
  return NextResponse.json({ success: true });
}
