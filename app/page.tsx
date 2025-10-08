'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente a /ciompi
    router.replace('/ciompi');
  }, [router]);

  // Mostrar loading mientras se redirige
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <CircularProgress size={60} />
    </Box>
  );
}
