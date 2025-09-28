import { GET } from '@/app/api/clientes/[id]/route';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { ClienteType, RouteParams } from '@/lib/types';
import { Stack } from '@mui/material';
import React from 'react';

async function cargarDatosCliente({ params }: RouteParams) {
  // Simula un objeto NextRequest mínimo para pasar como primer argumento
  const fakeRequest = {
    nextUrl: { searchParams: new URLSearchParams({}) },
  } as any;
  const clienteData = await GET(fakeRequest, { params });
  console.log('Params: ', params);
  console.log('Cliente Data: ', clienteData);

  //   try {
  //     connectDB();
  //     const clienteEncontrado = await Cliente.findById(params.clienteId);

  // await connectDB();
  // const datosClliente = await cliente.find();
  // return datosClliente;
  return { id: '1', NOMBRE: 'Cliente Ejemplo', CODCLI: 'C001' } as ClienteType;
}

// type ClienteDetailProps = { cliente: ClienteType };

export default async function ClienteDetailPage({ params }: RouteParams) {
  const cliente: ClienteType = await cargarDatosCliente({ params });
  console.log('ClienteDetailPage', cliente);

  return (
    <Stack bgcolor={blanco}>
      <Stack
        spacing={2}
        p={4}
        borderRadius={3}
        boxShadow={2}
        bgcolor={grisClaro}
        maxWidth={400}
        mx="auto"
        my={6}
        border={`1px solid ${grisMedio}`}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <span style={{ fontWeight: 700, fontSize: 24, color: grisMedio }}>
            {cliente?.NOMBRE ?? '-'}
          </span>
        </Stack>
        <Stack spacing={1}>
          <span>
            <strong>ID:</strong> {cliente.id}
          </span>
          <span>
            <strong>Nombre:</strong> {cliente?.NOMBRE ?? '-'}
          </span>
          <span>
            <strong>Teléfono:</strong> {cliente?.TELEFONO ?? '-'}
          </span>
          <span>
            <strong>Dirección:</strong> {cliente?.DIRECCION ?? '-'}
          </span>
          <span>
            <strong>Provincia:</strong> {cliente?.CODCLI ?? '-'}
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
}
