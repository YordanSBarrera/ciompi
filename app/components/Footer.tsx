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
    >
      <LogoApp widthProps={120} />
      <Typography variant="body2">Footer</Typography>
    </Stack>
  );
};
export default Footer;
