import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { UserAvatar } from '../userAvatar/UserAvatar';
import Typography from '@mui/material/Typography';
import WavesImg from '../../assets/waves.svg';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const HomeGreeting = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const configApi = useApi(configApiRef);
  const color1 =
    (isDarkMode
      ? configApi.app?.branding?.theme?.dark?.headerColor1
      : configApi.app?.branding?.theme?.light?.headerColor1) ?? '#45556D';
  const color2 =
    (isDarkMode
      ? configApi.app?.branding?.theme?.dark?.headerColor2
      : configApi.app?.branding?.theme?.light?.headerColor2) ?? '#86F4CE';

  return (
    <Box
      sx={{
        background: `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`,
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '90%',
          margin: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <Box>
          <UserAvatar width="120px" height="120px" />
        </Box>
        <Box>
          <Typography variant="h3">Bem Vindo de volta, Valber</Typography>
          <Typography variant="h6">Let's get started.</Typography>
        </Box>
      </Box>
      <img
        src={WavesImg}
        alt=""
        style={{
          width: '100%',
          height: '250px',
          objectFit: 'cover',
          position: 'absolute',
          top: '-20%',
          left: '0',
          opacity: '0.7',
        }}
      />
    </Box>
  );
};
