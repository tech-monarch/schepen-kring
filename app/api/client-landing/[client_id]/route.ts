import { NextResponse } from "next/server"
import { mockClientData } from "@/lib/mockClientData"

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [
    { client_id: 'client1' },
    { client_id: 'client2' },
    { client_id: 'client3' },
    { client_id: 'client4' },
    { client_id: 'client5' },
  ];
}

export async function GET(request: Request, context: any) {
  const { client_id } = context.params

  if (!client_id) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
  }

  const clientData = mockClientData[client_id]

  if (!clientData) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  return NextResponse.json(clientData)
}