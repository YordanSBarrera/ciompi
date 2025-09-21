'use client';

import { createTheme } from '@mui/material/styles';

export const Theme = createTheme({
  palette: {
    primary: {
      main: '#304057', // azulBase
      light: '#5A7A9A', // azulClaro
      dark: '#1E2A38', // azul más oscuro
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7B47', // naranja
      light: '#FFA57D',
      dark: '#D45A28',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA', // grisClaro
      paper: '#FFFFFF', // blanco
    },
    text: {
      primary: '#2A2D34', // grisOscuro
      secondary: '#5C6370', // grisTexto
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: '#388E3C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    button: {
      textTransform: 'none', // Para que los botones no tengan mayúsculas
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Bordes redondeados generales
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
