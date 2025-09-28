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

import { connectDB } from '@/db/dbConnection';
import cliente from '@/models/cliente';
import { ClienteType } from '@/lib/types';
import ListaClientes from '@/app/components/ListaClientes';

async function cargarClientes(): Promise<ClienteType[]> {
  try {
    await connectDB();
    const listaClientes = await cliente.find().lean();
    return JSON.parse(JSON.stringify(listaClientes));
  } catch (error) {
    console.error('Error cargando clientes:', error);
    return [];
  }
}

export default async function ClientesPage() {
  const clientes = await cargarClientes();

  return <ListaClientes clientes={clientes} />;
}
