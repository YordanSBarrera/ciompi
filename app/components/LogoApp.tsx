'use client';
import { Box, styled } from '@mui/material';
import Link from 'next/link';
import ciompiLogo from '@/public/ciompiLogo.webp';
import Image from 'next/image';
import { routes } from '@/lib/rutas';
import { Url } from 'url';

const AnimatedLogo = styled(Image)`
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.3s ease;
  &:hover {
    transform: scale(1.08) rotate(2deg);
    filter: brightness(1.15) contrast(1.1);
  }
`;

type MyLogoProps = {
  widthProps?: number;
  linkTo?: string;
};

const LogoApp = ({ widthProps = 150, linkTo = routes.home }: MyLogoProps) => {
  return (
    <Link href={linkTo}>
      <Box component="span">
        <AnimatedLogo src={ciompiLogo} alt="ciompi logo" width={widthProps} />
      </Box>
    </Link>
  );
};

export default LogoApp;
