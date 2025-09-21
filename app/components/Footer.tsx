import { Stack, Typography } from '@mui/material';
import { azulBase } from '@/lib/color';
import LogoApp from './LogoApp';

const Footer = () => {
  return (
    <Stack
      textAlign="center"
      bgcolor={azulBase}
      color="#fff"
      borderRadius={1}
      width="100%"
      direction="row"
      justifyContent="space-evenly"
      alignItems="center"
      height={'7vw'}
    >
      <Typography variant="body2">Footer</Typography>
      <LogoApp widthProps={100} />
    </Stack>
  );
};
export default Footer;
