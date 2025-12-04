import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/dbConnection';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import Empresa from '@/models/empresa';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    if (!empresaId || !fechaInicio || !fechaFin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Empresa, fecha inicio y fecha fin son requeridos',
        },
        { status: 400 }
      );
    }

    // Obtener información de la empresa
    const empresa = await Empresa.findById(empresaId).lean();

    // Convertir fechas a objetos Date
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Buscar financiamientos de la empresa especificada
    const financiamientos = await Financiamiento.find({
      empresa: empresaId,
      estadoFinanciamiento: { $in: ['activo', 'en_mora'] },
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula correo DIRECCION profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Padron Año Color Descripcion disponible')
      .populate('empresa', 'nombre descripcion telefono')
      .lean();

    // Obtener todos los pagos para verificar cuotas pagadas
    const pagos = await PagoCuota.find({
      financiamiento: { $in: financiamientos.map((f: any) => f._id) },
      confirmado: true,
    }).lean();

    // Crear un mapa de pagos por financiamiento
    const pagosPorFinanciamiento = new Map();
    pagos.forEach((pago: any) => {
      const finId = pago.financiamiento.toString();
      if (!pagosPorFinanciamiento.has(finId)) {
        pagosPorFinanciamiento.set(finId, []);
      }
      pagosPorFinanciamiento.get(finId).push(pago);
    });

    // Procesar cada financiamiento para encontrar cuotas por vencer
    const resultados: any[] = [];

    for (const financiamiento of financiamientos as any[]) {
      const finId = financiamiento._id.toString();
      const pagosFin = pagosPorFinanciamiento.get(finId) || [];
      const cuotasPagadas = new Set(pagosFin.map((p: any) => p.numeroCuota));

      let cuotasPorVencer: any[] = [];

      if (financiamiento.cuotasFuturas && Array.isArray(financiamiento.cuotasFuturas)) {
        cuotasPorVencer = financiamiento.cuotasFuturas.filter((cuota: any) => {
          const fechaVencimiento = new Date(cuota.fechaVencimiento);
          const enRango =
            fechaVencimiento >= fechaInicioDate &&
            fechaVencimiento <= fechaFinDate;
          const noPagada = !cuotasPagadas.has(cuota.numeroCuota);
          return enRango && noPagada;
        });
      } else {
        const fechaPrimeraCuota = new Date(financiamiento.fechaPrimeraCuota);
        for (let i = 0; i < financiamiento.cuotas; i++) {
          const fechaVencimiento = new Date(fechaPrimeraCuota);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
          const enRango =
            fechaVencimiento >= fechaInicioDate &&
            fechaVencimiento <= fechaFinDate;
          const numeroCuota = i + 1;
          const noPagada = !cuotasPagadas.has(numeroCuota);
          if (enRango && noPagada) {
            cuotasPorVencer.push({
              numeroCuota,
              fechaVencimiento,
              valorCuota: financiamiento.valorCuota || 0,
            });
          }
        }
      }

      if (cuotasPorVencer.length > 0) {
        resultados.push({
          ...financiamiento,
          cuotasPorVencer,
          totalCuotasPorVencer: cuotasPorVencer.length,
          montoTotalPorVencer: cuotasPorVencer.reduce(
            (sum: number, cuota: any) => sum + (cuota.valorCuota || 0),
            0
          ),
        });
      }
    }

    // Generar HTML para impresión
    const html = generateVencimientosReportHTML(
      resultados,
      empresa,
      fechaInicio,
      fechaFin
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de vencimientos:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error generando reporte: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generateVencimientosReportHTML(
  financiamientos: any[],
  empresa: any,
  fechaInicio: string,
  fechaFin: string
): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fechaInicioFormatted = new Date(fechaInicio).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fechaFinFormatted = new Date(fechaFin).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalCuotas = financiamientos.reduce(
    (sum, fin) => sum + (fin.totalCuotasPorVencer || 0),
    0
  );

  const totalMonto = financiamientos.reduce(
    (sum, fin) => sum + (fin.montoTotalPorVencer || 0),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cuotas por Vencer - ${empresa?.nombre || 'Empresa'} - CIOMPI</title>
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
      
      .page-break {
        page-break-after: always;
      }
      
      .section {
        page-break-inside: avoid;
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
      border-bottom: 3px solid #1e88e5;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-size: 20px;
      color: #1e88e5;
      margin-bottom: 5px;
      font-weight: 700;
    }
    
    .header .subtitle {
      font-size: 12px;
      color: #666;
      margin-bottom: 3px;
    }
    
    .header .fecha {
      font-size: 10px;
      color: #999;
    }
    
    .filtros {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    
    .filtro-item {
      padding: 5px;
    }
    
    .filtro-label {
      font-size: 8px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 3px;
    }
    
    .filtro-value {
      font-size: 10px;
      color: #333;
      font-weight: 500;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-box {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
      text-align: center;
    }
    
    .summary-box.success {
      border-left-color: #4caf50;
    }
    
    .summary-box.warning {
      border-left-color: #ff9800;
    }
    
    .summary-box h3 {
      font-size: 9px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      font-weight: 600;
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
      background: #1e88e5;
      color: white;
    }
    
    th {
      padding: 6px 4px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1565c0;
      font-size: 8px;
    }
    
    td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      font-size: 8px;
    }
    
    tbody tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
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
    <h1>CUOTAS POR VENCER</h1>
    <p class="subtitle">${empresa?.nombre || 'Empresa'}</p>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>
  
  <div class="filtros">
    <div class="filtro-item">
      <div class="filtro-label">Empresa</div>
      <div class="filtro-value">${empresa?.nombre || 'N/A'}</div>
    </div>
    <div class="filtro-item">
      <div class="filtro-label">Fecha Inicio</div>
      <div class="filtro-value">${fechaInicioFormatted}</div>
    </div>
    <div class="filtro-item">
      <div class="filtro-label">Fecha Fin</div>
      <div class="filtro-value">${fechaFinFormatted}</div>
    </div>
  </div>
  
  <div class="summary">
    <div class="summary-box">
      <h3>Financiamientos</h3>
      <div class="value">${financiamientos.length}</div>
    </div>
    <div class="summary-box success">
      <h3>Total Cuotas</h3>
      <div class="value">${totalCuotas}</div>
    </div>
    <div class="summary-box warning">
      <h3>Total Monto</h3>
      <div class="value">${formatCurrency(totalMonto)}</div>
    </div>
  </div>
  
  ${
    financiamientos.length === 0
      ? '<div class="no-data">No se encontraron cuotas por vencer en el rango de fechas seleccionado</div>'
      : `
  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Vehículo</th>
        <th class="text-center">Cuotas</th>
        <th class="text-right">Monto Total</th>
        <th class="text-center">Próxima Cuota</th>
        <th class="text-right">Valor Próxima</th>
      </tr>
    </thead>
    <tbody>
      ${financiamientos
        .map((fin) => {
          const clienteNombre =
            typeof fin.cliente === 'object' ? fin.cliente.NOMBRE : 's/n';
          const vehiculoInfo =
            typeof fin.vehiculo === 'object'
              ? `${fin.vehiculo.Marca || ''} ${fin.vehiculo.Modelo || ''}`.trim() || 's/v'
              : 's/v';
          
          const cuotasOrdenadas = [...fin.cuotasPorVencer].sort(
            (a, b) =>
              new Date(a.fechaVencimiento).getTime() -
              new Date(b.fechaVencimiento).getTime()
          );
          const proximaCuota = cuotasOrdenadas[0];

          return `
        <tr>
          <td>${clienteNombre}</td>
          <td>${vehiculoInfo}</td>
          <td class="text-center">${fin.totalCuotasPorVencer}</td>
          <td class="text-right">${formatCurrency(fin.montoTotalPorVencer)}</td>
          <td class="text-center">${
            proximaCuota
              ? `#${proximaCuota.numeroCuota} - ${formatDate(proximaCuota.fechaVencimiento)}`
              : 'N/A'
          }</td>
          <td class="text-right">${
            proximaCuota ? formatCurrency(proximaCuota.valorCuota) : 'N/A'
          }</td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>
  `
  }
  
  <div class="footer">
    <p>Reporte generado por CIOMPI - Sistema de Gestión de Financiamientos</p>
  </div>
</body>
</html>
  `;

  return html;
}

