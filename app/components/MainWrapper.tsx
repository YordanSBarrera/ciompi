// import { Container, Stack } from '@mui/material';
// import { ReactNode } from 'react';
// import SearchAppBar from './searchAppBar/SearchAppBar';
// import Footer from './Footer';
// // import { imgLocal } from '@/lib/imagenes'
// import imgLocal from '@/public/ciompiLocal.webp';

// type MainWrapperProps = {
//   children: ReactNode;
// };

// const MainWrapper = ({ children }: MainWrapperProps) => {
//   return (
//     <Stack
//       sx={{
//         mt: 0,
//         width: '100vw',
//         backgroundImage: `url(${imgLocal})`,
//         backgroundPosition: 'top center',
//         backgroundSize: 'cover',
//         backgroundRepeat: 'no-repeat',
//         backgroundAttachment: 'fixed',

//         minHeight: '100vh',
//       }}
//     >
//       <Container>
//         <Stack alignSelf="flex-start">
//           <SearchAppBar />
//         </Stack>
//         <Stack width="100%" justifyContent="center">
//           {children}
//         </Stack>
//         <Stack
//           position="fixed"
//           // width="100%"
//           width="100vw"
//           bottom={0}
//         >
//           <Footer />
//         </Stack>
//       </Container>
//     </Stack>
//   );
// };

// export default MainWrapper;
import { Container, Stack, Box } from '@mui/material';
import { ReactNode } from 'react';
import SearchAppBar from './searchAppBar/SearchAppBar';
import Footer from './Footer';
import imgLocal from '@/public/ciompiLocal.webp';

type MainWrapperProps = {
  children: ReactNode;
};

const MainWrapper = ({ children }: MainWrapperProps) => {
  return (
    <Stack
      sx={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondo con overlay para transparencia */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',

          backgroundColor: 'rgba(255, 255, 255, 0.5)', // 50% de transparencia
        }}
      />

      {/* Contenido principal */}
      <Stack
        sx={{
          position: 'relative', // Para que quede sobre el fondo
          zIndex: 1,
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Container
          maxWidth="lg" // o "xl" según tus necesidades
          sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 3 }, // Padding responsive
          }}
        >
          {/* Header con ancho completo */}
          <Stack width="100%">
            <SearchAppBar />
          </Stack>

          {/* Contenido principal */}
          <Stack
            width="100%"
            justifyContent="center"
            sx={{
              flex: 1,
              py: { xs: 2, sm: 3, md: 4 }, // Padding vertical responsive
            }}
          >
            {children}
          </Stack>
        </Container>

        {/* Footer fijo en la parte inferior */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 2,
          }}
        >
          <Container
            maxWidth="lg" // Mismo maxWidth que el contenido principal
            sx={{
              width: '100%',
              p: 0, // Sin padding para que el footer ocupe todo el ancho del container
            }}
          >
            <Footer />
          </Container>
        </Box>
      </Stack>
    </Stack>
  );
};

export default MainWrapper;
