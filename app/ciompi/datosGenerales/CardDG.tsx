import { grisClaro } from '@/lib/color';
import { Grid, Paper, Typography } from '@mui/material';
import React from 'react';

interface CardProps {
  titulo: string;
  children: React.ReactNode;
}

const CardDG = ({ titulo, children }: CardProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: grisClaro }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}
      >
        {titulo}
      </Typography>
      {children}
    </Paper>
  );
};

export default CardDG;
