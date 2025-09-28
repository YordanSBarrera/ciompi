'use client';
import Image from 'next/image';
import imgLocal from '@/public/ciompiLocal.webp';
import { Stack } from '@mui/material';
import UserLogin from './components/UserLogin';

export default function Home() {
  return (
    <Stack position="relative" width="100%" height="70vw">
      <Image
        src={imgLocal}
        alt="img del local"
        fill
        // style={{
        //   objectFit: 'cover',
        //   objectPosition: 'center',
        // }}
        style={{
          objectFit: 'contain',
          objectPosition: 'center',
          width: '100%',
          height: '100%',
        }}
      />
      <UserLogin />
    </Stack>
  );
}
