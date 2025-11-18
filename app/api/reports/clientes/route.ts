import { connectDB } from '@/db/dbConnection';
import Cliente from '@/models/cliente';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener todos los clientes
    const clientes = await Cliente.find().sort({ NOMBRE: 1 });

    // Generar HTML para impresión
    const html = generateClientesReportHTML(clientes);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de clientes:', error);
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    );
  }
}

function generateClientesReportHTML(clientes: any[]): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Listado de Clientes - CIOMPI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      @page {
        size: A4 landscape;
        margin: 1cm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-after: always;
      }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: #333;
      background: white;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 3px solid #1e88e5;
      padding-bottom: 15px;
    }
    
    .header h1 {
      font-size: 24px;
      color: #1e88e5;
      margin-bottom: 5px;
    }
    
    .header .fecha {
      font-size: 12px;
      color: #666;
    }
    
    .info-box {
      background: #f5f5f5;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
    }
    
    .info-box p {
      margin: 5px 0;
      font-size: 11px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9px;
    }
    
    thead {
      background: #1e88e5;
      color: white;
    }
    
    th {
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1565c0;
    }
    
    td {
      padding: 6px;
      border: 1px solid #ddd;
    }
    
    tbody tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    tbody tr:hover {
      background: #e3f2fd;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>LISTADO DE CLIENTES</h1>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  <div class="info-box">
    <p><strong>Total de clientes:</strong> ${clientes.length}</p>
  </div>
  
  ${clientes.length === 0 ? '<div class="no-data">No hay clientes registrados</div>' : `
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 25%;">Nombre</th>
        <th style="width: 15%;">Cédula</th>
        <th style="width: 20%;">Teléfono</th>
        <th style="width: 20%;">Dirección</th>
        <th style="width: 10%;">Correo</th>
        <th style="width: 10%;">Profesión</th>
      </tr>
    </thead>
    <tbody>
      ${clientes
        .map(
          (cliente, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td><strong>${cliente.NOMBRE || '-'}</strong></td>
          <td>${cliente.cedula || '-'}</td>
          <td>${cliente.TELEFONO || '-'}</td>
          <td>${cliente.DIRECCION || '-'}</td>
          <td>${cliente.correo || '-'}</td>
          <td>${cliente.profesion || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `}
  
  <div class="footer">
    <p>CIOMPI - Sistema de Gestión de Financiamientos</p>
    <p>Página generada automáticamente</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  return html;
}

