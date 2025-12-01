import { Container, Stack } from '@mui/material';
import { ReactNode } from 'react';
import Footer from './Footer';
import { imgLocal } from '@/lib/imagenes';
import HeaderAppBar from './searchAppBar/HeaderAppBar';

type MainWrapperProps = {
  children: ReactNode;
};

const MainWrapper = ({ children }: MainWrapperProps) => {
  return (
    <Stack
      sx={{
        mt: 0,
        width: '100vw',
        backgroundImage: `url(${imgLocal})`,
        backgroundPosition: 'top center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* SearchAppBar positioned at the top */}
      <Stack
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
        }}
      >
        <HeaderAppBar />
      </Stack>

      {/* Main content area with proper spacing */}
      <Stack
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 'calc(100vh - 120px)', // Adjust based on header/footer height
          pb: 8, // Add padding bottom to prevent footer overlap
        }}
      >
        <Container sx={{ flex: 1 }}>{children}</Container>
      </Stack>

      {/* Footer positioned at the bottom */}
      <Stack
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
          width: '100%',
        }}
      >
        <Footer />
      </Stack>
    </Stack>
  );
};

export default MainWrapper;
