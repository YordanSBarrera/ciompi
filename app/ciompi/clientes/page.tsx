// // 'use client';
// import React from 'react';
// import { connectDB } from '@/db/dbConnection';
// import { blanco, grisClaro, grisMedio } from '@/lib/color';
// import { ClienteType } from '@/lib/types';
// import cliente from '@/models/cliente';
// import { Stack } from '@mui/material';
// import Link from 'next/link';

// async function cargarClientes() {
//   await connectDB();
//   const listaClientes = await cliente.find();
//   console.log('Clientes: ', listaClientes);
//   return listaClientes;
// }

// export default async function ListaClientes() {
//   const clientes: ClienteType[] = await cargarClientes();

//   return (
//     <Stack bgcolor={blanco}>
//       <table>
//         <thead>
//           <tr>
//             <th>Código</th>
//             <th>Nombre</th>
//             <th>Dirección</th>
//             <th>Teléfono</th>
//             <th>ID</th>
//           </tr>
//         </thead>
//         <tbody>
//           {clientes.map((cliente, index) => (
//             <tr
//               key={cliente.id}
//               style={{
//                 backgroundColor: index % 2 === 0 ? grisClaro : grisMedio,
//               }}
//             >
//               <td>{cliente.CODCLI}</td>
//               <td>{cliente.NOMBRE}</td>
//               <td>{cliente.DIRECCION || '-'}</td>
//               <td>{cliente.TELEFONO || '-'}</td>
//               <td>{cliente.id}</td>
//               <td>
//                 <Link href={`/clientes/${cliente.id}`}>
//                   <button>Detalles</button>
//                 </Link>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </Stack>
//   );
// }

'use client';
import React, { useState, useEffect } from 'react';
import { ClienteType } from '@/lib/types';
import ListaClientes from '@/app/components/ListaClientes';
import AuthGuard from '@/app/components/AuthGuard';
import { Box, CircularProgress, Alert } from '@mui/material';

async function cargarClientes(): Promise<ClienteType[]> {
  try {
    const response = await fetch('/api/clientes');
    if (!response.ok) {
      throw new Error('Error al cargar clientes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cargando clientes:', error);
    return [];
  }
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarListaClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const listaClientes = await cargarClientes();
      setClientes(listaClientes);
    } catch (err) {
      setError('Error al cargar la lista de clientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaClientes();
  }, []);

  const handleClienteEliminado = () => {
    // Recargar la lista después de eliminar un cliente
    cargarListaClientes();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <AuthGuard>
      <ListaClientes
        clientes={clientes}
        onClienteEliminado={handleClienteEliminado}
      />
    </AuthGuard>
  );
}
