import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener todos los financiamientos activos
    const financiamientos = await Financiamiento.find({
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    // Filtrar financiamientos con cuotas atrasadas
    const financiamientosConAtrasos: any[] = [];

    for (const financiamiento of financiamientos) {
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
        estadoPago: 'confirmado',
      }).select('numeroCuota esExtra');

      const numerosCuotasPagadas = new Set(
        pagos.filter(p => !p.esExtra).map(p => p.numeroCuota)
      );

      if (financiamiento.cuotasFuturas && financiamiento.cuotasFuturas.length > 0) {
        const cuotasAtrasadas = financiamiento.cuotasFuturas.filter(cuota => {
          const fechaVencimiento = new Date(cuota.fechaVencimiento);
          fechaVencimiento.setHours(0, 0, 0, 0);
          return (
            fechaVencimiento < hoy &&
            !numerosCuotasPagadas.has(cuota.numeroCuota)
          );
        });

        if (cuotasAtrasadas.length > 0) {
          const montoAtrasado = cuotasAtrasadas.reduce(
            (sum, cuota) => sum + cuota.valorCuota,
            0
          );

          financiamientosConAtrasos.push({
            ...financiamiento.toObject(),
            cuotasAtrasadas: cuotasAtrasadas.length,
            montoAtrasado,
          });
        }
      } else {
        const fechaPrimeraCuota = new Date(financiamiento.fechaPrimeraCuota);
        fechaPrimeraCuota.setHours(0, 0, 0, 0);

        if (fechaPrimeraCuota <= hoy) {
          const mesesTranscurridos = Math.max(
            0,
            Math.floor(
              (hoy.getTime() - fechaPrimeraCuota.getTime()) /
                (1000 * 60 * 60 * 24 * 30.44)
            ) + 1
          );

          const cuotasEsperadas = Math.min(
            mesesTranscurridos,
            financiamiento.cuotas
          );

          const cuotasAtrasadas = Math.max(
            0,
            cuotasEsperadas - financiamiento.cuotasPagadas
          );

          if (cuotasAtrasadas > 0) {
            const montoAtrasado = cuotasAtrasadas * financiamiento.valorCuota;

            financiamientosConAtrasos.push({
              ...financiamiento.toObject(),
              cuotasAtrasadas,
              montoAtrasado,
            });
          }
        }
      }
    }

    // Generar HTML para impresión
    const html = generateFinanciamientosAtrasadosReportHTML(
      financiamientosConAtrasos
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de financiamientos atrasados:', error);
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    );
  }
}

function generateFinanciamientosAtrasadosReportHTML(
  financiamientos: any[]
): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-UY');
  };

  // Calcular totales
  const totalAtrasados = financiamientos.length;
  const totalCuotasAtrasadas = financiamientos.reduce(
    (sum, fin) => sum + (fin.cuotasAtrasadas || 0),
    0
  );
  const totalMontoAtrasado = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoAtrasado || 0),
    0
  );

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financiamientos con Cuotas Atrasadas - CIOMPI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      @page {
        size: A4 landscape;
        margin: 0.8cm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .no-print {
        display: none;
      }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 9px;
      color: #333;
      background: white;
      padding: 15px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 3px solid #ff9800;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-size: 22px;
      color: #ff9800;
      margin-bottom: 5px;
    }
    
    .header .fecha {
      font-size: 11px;
      color: #666;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-box {
      background: #fff3e0;
      padding: 10px;
      border-radius: 5px;
      border-left: 4px solid #ff9800;
    }
    
    .summary-box.warning {
      border-left-color: #ff9800;
    }
    
    .summary-box.error {
      border-left-color: #f44336;
    }
    
    .summary-box h3 {
      font-size: 9px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .summary-box .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8px;
    }
    
    thead {
      background: #ff9800;
      color: white;
    }
    
    th {
      padding: 6px 4px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #f57c00;
      font-size: 8px;
    }
    
    td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      font-size: 8px;
    }
    
    tbody tr:nth-child(even) {
      background: #fff9e6;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .estado-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7px;
      font-weight: 600;
      text-transform: uppercase;
      background: #ff980020;
      color: #ff9800;
    }
    
    .cuotas-atrasadas {
      color: #f44336;
      font-weight: 600;
    }
    
    .monto-atrasado {
      color: #f44336;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FINANCIAMIENTOS CON CUOTAS ATRASADAS</h1>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  <div class="summary">
    <div class="summary-box warning">
      <h3>Total Financiamientos Atrasados</h3>
      <div class="value">${totalAtrasados}</div>
    </div>
    <div class="summary-box error">
      <h3>Total Cuotas Atrasadas</h3>
      <div class="value">${totalCuotasAtrasadas}</div>
    </div>
    <div class="summary-box error">
      <h3>Total Monto Atrasado</h3>
      <div class="value">${formatCurrency(totalMontoAtrasado)}</div>
    </div>
  </div>
  
  ${financiamientos.length === 0 ? '<div class="no-data">No hay financiamientos con cuotas atrasadas</div>' : `
  <table>
    <thead>
      <tr>
        <th style="width: 3%;">#</th>
        <th style="width: 15%;">Cliente</th>
        <th style="width: 12%;">Vehículo</th>
        <th style="width: 8%;">Matrícula</th>
        <th style="width: 8%;" class="text-right">Costo</th>
        <th style="width: 5%;" class="text-center">Cuotas Tot.</th>
        <th style="width: 6%;" class="text-center">Cuotas Pag.</th>
        <th style="width: 7%;" class="text-center">Cuotas Atr.</th>
        <th style="width: 8%;" class="text-right">Valor Cuota</th>
        <th style="width: 9%;" class="text-right">Monto Atrasado</th>
        <th style="width: 8%;" class="text-right">Saldo Pend.</th>
        <th style="width: 7%;" class="text-center">Estado</th>
        <th style="width: 8%;" class="text-center">Fecha Venta</th>
      </tr>
    </thead>
    <tbody>
      ${financiamientos
        .map(
          (fin, index) => {
            const clienteNombre =
              typeof fin.cliente === 'object' && fin.cliente
                ? fin.cliente.NOMBRE
                : '-';
            const vehiculoInfo =
              typeof fin.vehiculo === 'object' && fin.vehiculo
                ? `${fin.vehiculo.Marca || ''} ${fin.vehiculo.Modelo || ''}`.trim()
                : '-';
            const matricula =
              typeof fin.vehiculo === 'object' && fin.vehiculo
                ? fin.vehiculo.Matricula || '-'
                : '-';
            
            return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td><strong>${clienteNombre}</strong></td>
          <td>${vehiculoInfo}</td>
          <td>${matricula}</td>
          <td class="text-right">${formatCurrency(fin.costoVehiculo || 0)}</td>
          <td class="text-center">${fin.cuotas || 0}</td>
          <td class="text-center">${fin.cuotasPagadas || 0}</td>
          <td class="text-center cuotas-atrasadas">${fin.cuotasAtrasadas || 0}</td>
          <td class="text-right">${formatCurrency(fin.valorCuota || 0)}</td>
          <td class="text-right monto-atrasado"><strong>${formatCurrency(fin.montoAtrasado || 0)}</strong></td>
          <td class="text-right">${formatCurrency(fin.saldoPendiente || 0)}</td>
          <td class="text-center">
            <span class="estado-badge">
              ${fin.estadoFinanciamiento || 'activo'}
            </span>
          </td>
          <td class="text-center">${formatDate(fin.fechaVenta)}</td>
        </tr>
      `;
          }
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

