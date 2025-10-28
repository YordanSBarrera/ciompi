import { MenuItem } from '@mui/material';
import Link from 'next/link';

interface MenuItemFormattedProps {
  title: string;
  href: string;
  onHandleClose: () => void;
}

const MenuItemFormatted = ({
  title,
  href,
  onHandleClose,
}: MenuItemFormattedProps) => {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <MenuItem
        onClick={onHandleClose}
        sx={{
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
            color: '#ffffff',
          },
          '&:focus': {
            backgroundColor: '#444444',
          },
          py: 1.5,
          px: 2,
        }}
      >
        {title}
      </MenuItem>
    </Link>
  );
};

export default MenuItemFormatted;
