import { Container, Stack } from '@mui/material';
import { ReactNode } from 'react';
import SearchAppBar from './searchAppBar/SearchAppBar';
import Footer from './Footer';
import { imgLocal } from '@/lib/imagenes';

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
      }}
    >
      <Container>
        <Stack alignSelf="flex-start">
          <SearchAppBar />
        </Stack>
        <Stack width="100%" justifyContent="center">
          {children}
        </Stack>
        <Stack
          position="fixed"
          // width="100%"
          width="100vw"
          bottom={0}
        >
          <Footer />
        </Stack>
      </Container>
    </Stack>
  );
};

export default MainWrapper;
