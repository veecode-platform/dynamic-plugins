import { useEffect } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';
import { useUserProfile } from '@backstage/plugin-user-settings';
import Typography from '@mui/material/Typography';
import { Divider, ListItemIcon, MenuItem } from '@material-ui/core';
import { UserAvatar } from '../userAvatar/UserAvatar';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { configApiRef } from '@backstage/core-plugin-api';
import { UserEntity } from '@backstage/catalog-model';
import { Link } from 'react-router-dom';
import { Logout } from '../logout/Logout';

interface MenuItemsProps {
  anchorEl: HTMLElement | null;
  menuId: string;
  isOpen: boolean;
  handleClose: () => void;
}

export const MenuItems: React.FC<MenuItemsProps> = ({
  anchorEl,
  menuId,
  isOpen,
  handleClose,
}) => {
  const { displayName, backstageIdentity, profile } = useUserProfile();
  const catalogApi = useApi(catalogApiRef);
  const config = useApi(configApiRef);
  const supportUrl =
    config.app?.support?.url ??
    'https://github.com/orgs/veecode-platform/discussions';

  useEffect(() => {
    const fetchUserEntity = async () => {
      let userProfile;
      try {
        if (backstageIdentity?.userEntityRef) {
          userProfile = (await catalogApi.getEntityByRef(
            backstageIdentity.userEntityRef,
          )) as unknown as UserEntity;
        }
        return userProfile;
      } catch (_err) {
        return null;
      }
    };

    fetchUserEntity();
  }, [backstageIdentity, catalogApi]);

  const profileDisplayName = () => {
    const name = displayName;
    const regex = /^[^:/]+:[^/]+\/[^/]+$/;
    if (regex.test(name)) {
      return name
        .charAt(name.indexOf('/') + 1)
        .toLocaleUpperCase('en-US')
        .concat(name.substring(name.indexOf('/') + 2));
    }
    return name;
  };

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: 250,
          borderRadius: 2,
          mt: 1.25,
          mr: -0.5,
          boxShadow: 3,
        },
      }}
    >
      {/* Perfil */}
      <Box
        sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
      >
        <UserAvatar />
        <Box>
          <Typography variant="subtitle1">{profileDisplayName()}</Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Itens com ícones */}
      <MenuItem onClick={handleClose}>
        <Link to={supportUrl}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          Help
        </Link>
      </MenuItem>
      <MenuItem onClick={handleClose}>
        <Link to="/settings">
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </Link>
      </MenuItem>
      <Divider />

      {/* Logout */}
      <MenuItem>
        <Logout />
      </MenuItem>
    </Menu>
  );
};
