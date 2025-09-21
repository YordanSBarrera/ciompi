'use client';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Theme } from './StilosUI';

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={Theme}>
      <CssBaseline /> {/* Normaliza estilos CSS y aplica el fondo default */}
      {children}
    </ThemeProvider>
  );
}
