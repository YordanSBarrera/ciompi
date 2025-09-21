import { connectDB } from '@/db/dbConnection';
import { ClienteType } from '@/lib/types';
import cliente from '@/models/cliente';
import React from 'react';

export async function cargarClientes() {
  await connectDB();
  const listaClientes = await cliente.find();
  return listaClientes;
}

// export default async function HomePage() {
//   const tasks = await loadTasks();

export default async function ListaClientes() {
  const clientes = await cargarClientes();

  return (
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map(cliente => (
          <tr key={cliente.CODCLI}>
            <td>{cliente.CODCLI}</td>
            <td>{cliente.NOMBRE}</td>
            <td>{cliente.DIRECCION || '-'}</td>
            <td>{cliente.TELEFONO || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
