import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface MenuSimpleProps {
  isOpen: boolean;
  items: { label: string; action: () => void }[];
  onClose?: () => void;
  anchorEl?: null | HTMLElement;
}

export default function MenuSimple({
  isOpen,
  items,
  onClose,
  anchorEl,
}: MenuSimpleProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {items.map(item => (
        <MenuItem onClick={item.action}>{item.label}</MenuItem>
      ))}
    </Menu>
  );
}
