import { connectDB } from '@/app/db/dbConnection';
import Cliente from '@/app/models/cliente';
import { NextResponse } from 'next/server';

export async function GET() {
  connectDB();
  const cliente = await Cliente.find();
  return NextResponse.json(cliente);
}

export async function POST(request: Request) {
  connectDB();
  try {
    const body = await request.json();
    const newCliente = new Cliente(body);
    const savedCliente = await newCliente.save();
    return NextResponse.json(savedCliente);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else return NextResponse.json({ message: 'Error en algun lado ;-)' });
  }
}
