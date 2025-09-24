'use client';

import { Box, Typography, Paper } from '@mui/material';
import * as colors from '@/lib/color';

interface ColorSampleProps {
  colorName: string;
  colorValue: string;
  showHex?: boolean;
}

const ColorSample = ({
  colorName,
  colorValue,
  showHex = true,
}: ColorSampleProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        width: 150,
        height: 150,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          backgroundColor: colorValue,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          mb: 1,
        }}
      />
      <Typography variant="body2" fontWeight="bold" textAlign="center">
        {colorName}
      </Typography>
      {showHex && (
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {colorValue}
        </Typography>
      )}
    </Paper>
  );
};

export default ColorSample;
