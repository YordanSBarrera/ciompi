import { connectDB } from '@/db/dbConnection';
import Cliente from '@/models/cliente';
import Financiamiento from '@/models/financiamiento';
import PagoCuota from '@/models/pagoCuota';
import { formatMoney, normalizarMoneda } from '@/lib/moneda';
import { NextRequest, NextResponse } from 'next/server';

// Función para escapar HTML y prevenir errores
function escapeHtml(text: any): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Función para generar todas las cuotas de un financiamiento (misma lógica que el endpoint original)
function generarTodasLasCuotas(
  financiamiento: any,
  pagos: any[]
): Array<{
  numeroCuota: number;
  fechaVencimiento: Date;
  valorCuota: number;
  esExtra: boolean;
  montoPagado: number;
  pagada: boolean;
  montoPendiente: number;
}> {
  const pagosPorCuota: { [key: number]: number } = {};
  pagos
    .filter(
      pago =>
        !pago.esExtra && pago.numeroCuota && pago.estadoPago === 'confirmado'
    )
    .forEach(pago => {
      const numCuota = pago.numeroCuota!;
      if (!pagosPorCuota[numCuota]) {
        pagosPorCuota[numCuota] = 0;
      }
      pagosPorCuota[numCuota] += pago.montoPago;
    });

  const todasLasCuotas: Array<{
    numeroCuota: number;
    fechaVencimiento: Date;
    valorCuota: number;
    esExtra: boolean;
    pagada: boolean;
    montoPagado: number;
    montoPendiente: number;
  }> = [];

  if (
    financiamiento.cuotasFuturas &&
    financiamiento.cuotasFuturas.length > 0
  ) {
    financiamiento.cuotasFuturas.forEach((cuota: any) => {
      const fechaVencimiento = new Date(cuota.fechaVencimiento);
      const montoPagado = pagosPorCuota[cuota.numeroCuota] || 0;
      const pagada = montoPagado >= cuota.valorCuota;
      const montoPendiente = Math.max(0, cuota.valorCuota - montoPagado);

      todasLasCuotas.push({
        numeroCuota: cuota.numeroCuota,
        fechaVencimiento,
        valorCuota: cuota.valorCuota,
        esExtra: false,
        pagada,
        montoPagado,
        montoPendiente,
      });
    });
  } else {
    const fechaPrimera = new Date(financiamiento.fechaPrimeraCuota);
    for (let i = 1; i <= financiamiento.cuotas; i++) {
      const fechaVencimiento = new Date(fechaPrimera);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);

      const montoPagado = pagosPorCuota[i] || 0;
      const pagada = montoPagado >= financiamiento.valorCuota;
      const montoPendiente = Math.max(
        0,
        financiamiento.valorCuota - montoPagado
      );

      todasLasCuotas.push({
        numeroCuota: i,
        fechaVencimiento,
        valorCuota: financiamiento.valorCuota,
        esExtra: false,
        pagada,
        montoPagado,
        montoPendiente,
      });
    }
  }

  if (financiamiento.cuotasExtras && financiamiento.cuotasExtras > 0) {
    const fechaUltima =
      todasLasCuotas.length > 0
        ? new Date(todasLasCuotas[todasLasCuotas.length - 1].fechaVencimiento)
        : financiamiento.cuotasFuturas &&
            financiamiento.cuotasFuturas.length > 0
          ? new Date(
              financiamiento.cuotasFuturas[
                financiamiento.cuotasFuturas.length - 1
              ].fechaVencimiento
            )
          : new Date(financiamiento.fechaUltimaCuota);

    for (let i = 1; i <= financiamiento.cuotasExtras; i++) {
      const fechaVencimiento = new Date(fechaUltima);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      const numeroCuotaExtra = financiamiento.cuotas + i;
      const montoPagadoExtra = pagos
        .filter(
          pago =>
            pago.esExtra &&
            pago.numeroCuota === numeroCuotaExtra &&
            pago.estadoPago === 'confirmado'
        )
        .reduce((sum: number, pago: any) => sum + pago.montoPago, 0);
      const montoPendienteExtra = Math.max(
        0,
        financiamiento.valorCuota - montoPagadoExtra
      );

      todasLasCuotas.push({
        numeroCuota: numeroCuotaExtra,
        fechaVencimiento,
        valorCuota: financiamiento.valorCuota,
        esExtra: true,
        pagada: montoPagadoExtra >= financiamiento.valorCuota,
        montoPagado: montoPagadoExtra,
        montoPendiente: montoPendienteExtra,
      });
    }
  }

  return todasLasCuotas.sort((a, b) => a.numeroCuota - b.numeroCuota);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');

    if (!busqueda || busqueda.trim() === '') {
      return NextResponse.json(
        { error: 'Debe proporcionar un término de búsqueda' },
        { status: 400 }
      );
    }

    // Buscar cliente por nombre o cédula
    const cliente = await Cliente.findOne({
      $or: [
        { NOMBRE: { $regex: busqueda.trim(), $options: 'i' } },
        { cedula: { $regex: busqueda.trim(), $options: 'i' } },
      ],
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Buscar todos los financiamientos donde el cliente es cliente principal o cliente2
    const financiamientos = await Financiamiento.find({
      $or: [{ cliente: cliente._id }, { cliente2: cliente._id }],
    })
      .populate('cliente', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('cliente2', 'NOMBRE TELEFONO cedula DIRECCION correo profesion')
      .populate('vehiculo', 'Marca Modelo Matricula Año Color')
      .populate('empresa', 'nombre descripcion telefono')
      .sort({ fechaVenta: -1 });

    if (financiamientos.length === 0) {
      return NextResponse.json(
        { error: 'El cliente no tiene financiamientos asociados' },
        { status: 404 }
      );
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const resumenesFinanciamientos: any[] = [];
    const todasLasCuotas: any[] = [];

    for (const financiamiento of financiamientos) {
      const pagos = await PagoCuota.find({
        financiamiento: financiamiento._id,
      }).select('numeroCuota esExtra montoPago estadoPago fechaPago');

      const cuotas = generarTodasLasCuotas(financiamiento, pagos);

      let cuotasVencidasFin = 0;

      cuotas.forEach(cuota => {
        const fechaVenc = new Date(cuota.fechaVencimiento);
        fechaVenc.setHours(0, 0, 0, 0);
        const vencida = !cuota.pagada && fechaVenc < hoy;

        let estado: 'pagada' | 'parcial' | 'vencida' | 'pendiente';
        let diasAtraso: number | undefined;

        if (cuota.pagada) {
          estado = 'pagada';
        } else if (cuota.montoPagado > 0) {
          estado = 'parcial';
        } else if (vencida) {
          estado = 'vencida';
          cuotasVencidasFin++;
          diasAtraso = Math.floor(
            (hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else {
          estado = 'pendiente';
        }

        todasLasCuotas.push({
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento,
          valorCuota: cuota.valorCuota,
          montoPagado: cuota.montoPagado,
          montoPendiente: cuota.montoPendiente,
          pagada: cuota.pagada,
          esExtra: cuota.esExtra,
          moneda: financiamiento.moneda,
          financiamientoId: financiamiento._id?.toString() || '',
          financiamientoNumero: financiamiento._id?.toString().slice(-8),
          vehiculo: financiamiento.vehiculo,
          empresa: financiamiento.empresa,
          estado,
          diasAtraso,
        });
      });

      // Calcular progreso del financiamiento
      const totalCuotas = financiamiento.cuotas + (financiamiento.cuotasExtras || 0);
      const progreso = totalCuotas > 0 
        ? Math.round(((financiamiento.cuotasPagadas || 0) / totalCuotas) * 100)
        : 0;

      resumenesFinanciamientos.push({
        financiamientoId: financiamiento._id?.toString() || '',
        numeroFinanciamiento: financiamiento._id?.toString().slice(-8),
        vehiculo: financiamiento.vehiculo,
        empresa: financiamiento.empresa,
        estadoFinanciamiento: financiamiento.estadoFinanciamiento,
        fechaVenta: financiamiento.fechaVenta,
        moneda: financiamiento.moneda,
        montoTotal: financiamiento.montoTotal,
        montoPagado: financiamiento.montoPagado || 0,
        saldoPendiente: financiamiento.saldoPendiente || 0,
        cuotasTotal: totalCuotas,
        cuotasPagadas: financiamiento.cuotasPagadas || 0,
        cuotasPendientes: cuotas.length - (financiamiento.cuotasPagadas || 0),
        cuotasVencidas: cuotasVencidasFin,
        progreso,
      });
    }

    // Ordenar cuotas por fecha de vencimiento
    todasLasCuotas.sort((a, b) => {
      const fechaA = new Date(a.fechaVencimiento);
      const fechaB = new Date(b.fechaVencimiento);
      return fechaA.getTime() - fechaB.getTime();
    });

    const montosPorMoneda = {
      USD: {
        totalFinanciado: 0,
        totalPagado: 0,
        totalSaldoPendiente: 0,
        montoVencido: 0,
      },
      UYU: {
        totalFinanciado: 0,
        totalPagado: 0,
        totalSaldoPendiente: 0,
        montoVencido: 0,
      },
    };

    for (const fin of resumenesFinanciamientos) {
      const m = normalizarMoneda(fin.moneda);
      montosPorMoneda[m].totalFinanciado += fin.montoTotal || 0;
      montosPorMoneda[m].totalPagado += fin.montoPagado || 0;
      montosPorMoneda[m].totalSaldoPendiente += fin.saldoPendiente || 0;
    }

    for (const c of todasLasCuotas) {
      if (c.estado === 'vencida') {
        const m = normalizarMoneda(c.moneda);
        montosPorMoneda[m].montoVencido += c.montoPendiente || 0;
      }
    }

    // Calcular resumen general
    const resumen = {
      totalFinanciamientos: resumenesFinanciamientos.length,
      totalMontoFinanciado: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.montoTotal,
        0
      ),
      totalMontoPagado: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.montoPagado,
        0
      ),
      totalSaldoPendiente: resumenesFinanciamientos.reduce(
        (sum, fin) => sum + fin.saldoPendiente,
        0
      ),
      totalCuotas: todasLasCuotas.length,
      totalCuotasPagadas: todasLasCuotas.filter(c => c.pagada).length,
      totalCuotasPendientes: todasLasCuotas.filter(c => !c.pagada).length,
      totalCuotasVencidas: todasLasCuotas.filter(c => c.estado === 'vencida')
        .length,
      montoVencido: todasLasCuotas
        .filter(c => c.estado === 'vencida')
        .reduce((sum, c) => sum + c.montoPendiente, 0),
      montosPorMoneda,
    };

    // Generar HTML para impresión
    const html = generateEstadoCuentaReportHTML(
      cliente,
      resumenesFinanciamientos,
      todasLasCuotas,
      resumen
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando reporte de estado de cuenta:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error generando reporte: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generateEstadoCuentaReportHTML(
  cliente: any,
  financiamientos: any[],
  cuotas: any[],
  resumen: any
): string {
  const fechaActual = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fmt = (amount: number, moneda?: unknown) =>
    formatMoney(amount, normalizarMoneda(moneda));

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-UY');
    } catch {
      return '-';
    }
  };

  const extraClienteHtml =
    (cliente.cedula
      ? `<p><strong>Cédula:</strong> ${escapeHtml(cliente.cedula)}</p>`
      : '') +
    (cliente.TELEFONO
      ? `<p><strong>Teléfono:</strong> ${escapeHtml(cliente.TELEFONO)}</p>`
      : '') +
    (cliente.DIRECCION
      ? `<p><strong>Dirección:</strong> ${escapeHtml(cliente.DIRECCION)}</p>`
      : '') +
    (cliente.correo
      ? `<p><strong>Email:</strong> ${escapeHtml(cliente.correo)}</p>`
      : '');

  const getEstadoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      activo: 'Activo',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
      en_mora: 'En Mora',
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      activo: '#4caf50',
      finalizado: '#2196f3',
      cancelado: '#f44336',
      en_mora: '#ff9800',
    };
    return colores[estado] || '#757575';
  };

  const getCuotaEstadoLabel = (estado: string, diasAtraso?: number) => {
    if (estado === 'pagada') return 'Pagada';
    if (estado === 'parcial') return 'Parcial';
    if (estado === 'vencida') {
      return diasAtraso ? `Vencida (${diasAtraso}d)` : 'Vencida';
    }
    return 'Pendiente';
  };

  const getCuotaEstadoColor = (estado: string) => {
    if (estado === 'pagada') return '#4caf50';
    if (estado === 'parcial') return '#ff9800';
    if (estado === 'vencida') return '#f44336';
    return '#757575';
  };

  const lineaMontosVencidos =
    resumen.montoVencido > 0
      ? `<div style="font-size: 7px; margin-top: 3px;">Montos vencidos | USD: ${fmt(resumen.montosPorMoneda.USD.montoVencido, 'USD')} | UYU: ${fmt(resumen.montosPorMoneda.UYU.montoVencido, 'UYU')}</div>`
      : '';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estado de Cuenta - ${escapeHtml(cliente.NOMBRE || 'Cliente')} - CIOMPI</title>
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
      font-size: 8px;
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
      font-size: 22px;
      color: #1e88e5;
      margin-bottom: 5px;
    }
    
    .header .fecha {
      font-size: 11px;
      color: #666;
    }
    
    .cliente-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 15px;
      border-left: 4px solid #1e88e5;
    }
    
    .cliente-info h2 {
      font-size: 14px;
      color: #1e88e5;
      margin-bottom: 8px;
    }
    
    .cliente-info p {
      font-size: 9px;
      margin: 3px 0;
      color: #666;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-box {
      background: #e3f2fd;
      padding: 10px;
      border-radius: 5px;
      border-left: 4px solid #1e88e5;
      text-align: center;
    }
    
    .summary-box.success {
      background: #e8f5e9;
      border-left-color: #4caf50;
    }
    
    .summary-box.warning {
      background: #fff3e0;
      border-left-color: #ff9800;
    }
    
    .summary-box.error {
      background: #ffebee;
      border-left-color: #f44336;
    }
    
    .summary-box h3 {
      font-size: 8px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .summary-box .value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 7px;
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
      font-size: 7px;
    }
    
    td {
      padding: 5px 4px;
      border: 1px solid #ddd;
      font-size: 7px;
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
    
    .estado-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #1e88e5;
      margin: 15px 0 10px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ESTADO DE CUENTA</h1>
    <p class="fecha">Generado el ${fechaActual}</p>
  </div>

  <!-- Información del Cliente -->
  <div class="cliente-info">
    <h2>Cliente: ${escapeHtml(cliente.NOMBRE || 'N/A')}</h2>
    ${extraClienteHtml}
  </div>

  <!-- Resumen General -->
  <div class="section-title">Resumen General</div>
  <div class="summary">
    <div class="summary-box">
      <h3>Total Financiamientos</h3>
      <div class="value">${resumen.totalFinanciamientos}</div>
    </div>
    <div class="summary-box">
      <h3>Monto Total Financiado</h3>
      <div class="value" style="font-size:10px;line-height:1.35;">
        <div>USD: ${fmt(resumen.montosPorMoneda.USD.totalFinanciado, 'USD')}</div>
        <div>UYU: ${fmt(resumen.montosPorMoneda.UYU.totalFinanciado, 'UYU')}</div>
      </div>
    </div>
    <div class="summary-box success">
      <h3>Monto Pagado</h3>
      <div class="value" style="font-size:10px;line-height:1.35;">
        <div>USD: ${fmt(resumen.montosPorMoneda.USD.totalPagado, 'USD')}</div>
        <div>UYU: ${fmt(resumen.montosPorMoneda.UYU.totalPagado, 'UYU')}</div>
      </div>
    </div>
    <div class="summary-box warning">
      <h3>Saldo Pendiente</h3>
      <div class="value" style="font-size:10px;line-height:1.35;">
        <div>USD: ${fmt(resumen.montosPorMoneda.USD.totalSaldoPendiente, 'USD')}</div>
        <div>UYU: ${fmt(resumen.montosPorMoneda.UYU.totalSaldoPendiente, 'UYU')}</div>
      </div>
    </div>
    <div class="summary-box">
      <h3>Total Cuotas</h3>
      <div class="value">${resumen.totalCuotas}</div>
    </div>
    <div class="summary-box success">
      <h3>Cuotas Pagadas</h3>
      <div class="value">${resumen.totalCuotasPagadas}</div>
    </div>
    <div class="summary-box warning">
      <h3>Cuotas Pendientes</h3>
      <div class="value">${resumen.totalCuotasPendientes}</div>
    </div>
    <div class="summary-box error">
      <h3>Cuotas Vencidas</h3>
      <div class="value">${resumen.totalCuotasVencidas}</div>
      ${lineaMontosVencidos}
    </div>
  </div>

  <!-- Resumen por Financiamiento -->
  <div class="section-title">Resumen por Financiamiento</div>
  <table>
    <thead>
      <tr>
        <th style="width: 3%;">#</th>
        <th style="width: 15%;">Vehículo</th>
        <th style="width: 12%;">Empresa</th>
        <th style="width: 10%;">Estado</th>
        <th style="width: 12%;" class="text-right">Monto Total</th>
        <th style="width: 12%;" class="text-right">Pagado</th>
        <th style="width: 12%;" class="text-right">Pendiente</th>
        <th style="width: 10%;" class="text-center">Cuotas</th>
        <th style="width: 8%;" class="text-center">Progreso</th>
      </tr>
    </thead>
    <tbody>
      ${financiamientos
        .map((fin, index) => {
          const vehiculoInfo =
            typeof fin.vehiculo === 'object' && fin.vehiculo
              ? (
                  String(fin.vehiculo.Marca || '').trim() +
                  ' ' +
                  String(fin.vehiculo.Modelo || '').trim()
                ).trim() || 'N/A'
              : 'N/A';
          const empresaInfo =
            typeof fin.empresa === 'object' && fin.empresa
              ? fin.empresa.nombre
              : 'N/A';
          const estadoColor = getEstadoColor(fin.estadoFinanciamiento);

          return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${escapeHtml(vehiculoInfo)}</td>
          <td>${escapeHtml(empresaInfo)}</td>
          <td>
            <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor};">
              ${getEstadoLabel(fin.estadoFinanciamiento)}
            </span>
          </td>
          <td class="text-right">${fmt(fin.montoTotal, fin.moneda)}</td>
          <td class="text-right" style="color: #4caf50;">${fmt(fin.montoPagado, fin.moneda)}</td>
          <td class="text-right" style="color: #ff9800;">${fmt(fin.saldoPendiente, fin.moneda)}</td>
          <td class="text-center">${fin.cuotasPagadas}/${fin.cuotasTotal}${fin.cuotasVencidas > 0 ? ' (' + fin.cuotasVencidas + ' vencidas)' : ''}</td>
          <td class="text-center">${fin.progreso}%</td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>

  <!-- Tabla de Todas las Cuotas -->
  <div class="section-title">Todas las Cuotas (${cuotas.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 3%;">#</th>
        <th style="width: 8%;">Fin.</th>
        <th style="width: 12%;">Vehículo</th>
        <th style="width: 6%;" class="text-center">Cuota</th>
        <th style="width: 10%;" class="text-center">Vencimiento</th>
        <th style="width: 10%;" class="text-right">Valor</th>
        <th style="width: 10%;" class="text-right">Pagado</th>
        <th style="width: 10%;" class="text-right">Pendiente</th>
        <th style="width: 10%;" class="text-center">Estado</th>
      </tr>
    </thead>
    <tbody>
      ${cuotas
        .map((cuota, index) => {
          const vehiculoInfo =
            typeof cuota.vehiculo === 'object' && cuota.vehiculo
              ? (
                  String(cuota.vehiculo.Marca || '').trim() +
                  ' ' +
                  String(cuota.vehiculo.Modelo || '').trim()
                ).trim() || 'N/A'
              : 'N/A';
          const estadoColor = getCuotaEstadoColor(cuota.estado);
          const bgColor =
            cuota.estado === 'pagada'
              ? '#e8f5e9'
              : cuota.estado === 'vencida'
                ? '#ffebee'
                : 'transparent';

          return `
        <tr style="background-color: ${bgColor};">
          <td class="text-center">${index + 1}</td>
          <td style="font-size: 6px;">${cuota.financiamientoNumero || 'N/A'}</td>
          <td style="font-size: 6px;">${escapeHtml(vehiculoInfo)}</td>
          <td class="text-center">#${cuota.numeroCuota}${cuota.esExtra ? ' (E)' : ''}</td>
          <td class="text-center">${formatDate(cuota.fechaVencimiento)}</td>
          <td class="text-right">${fmt(cuota.valorCuota, cuota.moneda)}</td>
          <td class="text-right" style="color: #4caf50;">${fmt(cuota.montoPagado || 0, cuota.moneda)}</td>
          <td class="text-right" style="color: #f44336;">${fmt(cuota.montoPendiente || 0, cuota.moneda)}</td>
          <td class="text-center">
            <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor};">
              ${getCuotaEstadoLabel(cuota.estado, cuota.diasAtraso)}
            </span>
          </td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>CIOMPI - Estado de Cuenta - ${fechaActual}</p>
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

