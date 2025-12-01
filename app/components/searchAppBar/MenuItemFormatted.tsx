import { ListItemIcon, MenuItem } from '@mui/material';
import Link from 'next/link';

interface MenuItemFormattedProps {
  title: string;
  href: string;
  onHandleClose: () => void;
  icon?: React.ReactNode;
}

const MenuItemFormatted = ({
  title,
  href,
  onHandleClose,
  icon,
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
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        {title}
      </MenuItem>
    </Link>
  );
};

export default MenuItemFormatted;
