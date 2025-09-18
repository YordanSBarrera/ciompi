import { Container, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import backgroung from '@/public/ciompiLocal.webp';

type MainWrapperProps = {
  children: ReactNode;
};

const MainWrapper = ({ children }: MainWrapperProps) => {
  return (
    <Stack
      sx={{
        mt: 0,
        width: '100vw',
        backgroundImage: `url(${backgroung})`,
        backgroundPosition: 'top center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: 'white',
        minHeight: '100vh',
      }}
    >
      <Container>
        <Stack alignSelf="flex-start">"Menu aca"</Stack>
        <Stack width="100%" justifyContent="center" mt="90px" mb="60px">
          <Typography variant="h4" component="h2" color="warning">
            {'Sitio Web en desarrollo'}
          </Typography>
          {children}
        </Stack>
        <Stack position="fixed" width="100%" bottom={0}>
          "Footer here"
        </Stack>
      </Container>
    </Stack>
  );
};

export default MainWrapper;
