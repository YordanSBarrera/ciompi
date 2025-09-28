import { Skeleton, Stack } from '@mui/material';

export default function LoadingClientes() {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Skeleton variant="rectangular" width={300} height={40} />
      <Skeleton variant="rectangular" width={500} height={56} />
      <Skeleton variant="rectangular" height={400} />
    </Stack>
  );
}
