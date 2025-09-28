import { Stack } from '@mui/material';
import UserLogin from './components/UserLogin';

export default function Home() {
  return (
    <Stack position="relative" width="100%" height="70vw">
      <UserLogin />
    </Stack>
  );
}
