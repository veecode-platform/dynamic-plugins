import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

interface IconButtonProps {
  title: string;
  label: string;
  color: 'warning' | 'error' | 'inherit';
  handleClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  link?: string;
  children: React.ReactNode;
}

export const IconButtonComponent: React.FC<IconButtonProps> = ({
  title,
  label,
  color,
  handleClick,
  link,
  children,
}) => {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        aria-label={label}
        color={color}
        aria-controls={`${label}-menu`}
        aria-haspopup="true"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
        }}
        onClick={handleClick ? handleClick : () => {}}
      >
        {link ? <Link to={link}>{children}</Link> : children}
      </IconButton>
    </Tooltip>
  );
};
