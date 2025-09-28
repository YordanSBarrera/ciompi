'use client';

import { Box, Typography, Grid } from '@mui/material';
import ColorSample from './ColorSample';
import * as colors from '@/lib/color';

const ColorPalette = () => {
  // Agrupar los colores por categorías
  const colorGroups = [
    {
      title: 'Colores Base',
      colors: [
        { name: 'azulBase', value: colors.azulBase },
        { name: 'azulClaro', value: colors.azulClaro },
        { name: 'blanco', value: colors.blanco },
        { name: 'grisClaro', value: colors.grisClaro },
        { name: 'grisMedio', value: colors.grisMedio },
      ],
    },
    {
      title: 'Colores de Acento',
      colors: [
        { name: 'naranja', value: colors.naranja },
        { name: 'turquesa', value: colors.turquesa },
        { name: 'amarillo', value: colors.amarillo },
      ],
    },
    {
      title: 'Colores Neutros',
      colors: [
        { name: 'grisOscuro', value: colors.grisOscuro },
        { name: 'grisTexto', value: colors.grisTexto },
      ],
    },
    {
      title: 'Colores Profesionales',
      colors: [
        { name: 'azulOscuro', value: colors.azulOscuro },
        { name: 'azulClaro1', value: colors.azulClaro1 },
        { name: 'beige1', value: colors.beige1 },
        { name: 'coral1', value: colors.coral1 },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Paleta de Colores
      </Typography>

      {colorGroups.map((group, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {group.title}
          </Typography>
          <Grid container spacing={2}>
            {group.colors.map((color, colorIndex) => (
              <Grid key={colorIndex}>
                <ColorSample colorName={color.name} colorValue={color.value} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default ColorPalette;
