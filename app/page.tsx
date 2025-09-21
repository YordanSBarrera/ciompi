'use client';
import Image from 'next/image';
import imgLocal from '@/public/ciompiLocal.webp';
import { Stack } from '@mui/material';

export default function Home() {
  return (
    <Stack
      border=" 1px solid red"
      position="relative"
      width="100%"
      height="70vw"
    >
      <Image
        src={imgLocal}
        alt="img del local"
        fill
        // style={{
        //   objectFit: 'cover',
        //   objectPosition: 'center',
        // }}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          width: '100%',
          height: '100%',
        }}
      />
    </Stack>
  );
}
