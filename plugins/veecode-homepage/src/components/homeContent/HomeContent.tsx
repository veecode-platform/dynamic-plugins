import {
  HomePageStarredEntities,
  HomePageToolkit,
  HomePageTopVisited,
  HomePageRecentlyVisited,
} from '@backstage/plugin-home';
import Grid from '@mui/material/Grid';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Content } from '@backstage/core-components';
import VeeCodeLogo from '../../assets/veecode-logo.svg';
import BackstageLogo from '../../assets/backstage.png';
import Icon from './Icon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const HomeContent = () => {
  const tools = [
    {
      url: 'https://docs.platform.vee.codes/',
      label: 'Docs',
      icon: <Icon src={VeeCodeLogo} />,
    },
    {
      url: 'https://github.com/orgs/veecode-platform/discussions',
      label: 'Community',
      icon: <Icon src={VeeCodeLogo} />,
    },
    {
      url: 'https://platform.vee.codes/',
      label: 'Website',
      icon: <Icon src={VeeCodeLogo} />,
    },
    {
      url: 'https://veecode-suporte.freshdesk.com/support/login',
      label: 'Support',
      icon: <Icon src={VeeCodeLogo} />,
    },
  ];

  return (
    <SearchContextProvider>
      <Content>
        <Grid container justifyContent="center" spacing={2}>
          <Grid container size={{ xs: 12 }} justifyContent="center">
            <Grid container size={{ xs: 12 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <HomePageTopVisited kind="recent" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <HomePageRecentlyVisited />
              </Grid>
            </Grid>

            <Grid container size={{ xs: 12 }}>
              <Grid size={{ xl: 8, lg: 8, md: 12, xs: 12 }}>
                <HomePageStarredEntities />
              </Grid>
              <Grid size={{ xl: 4, lg: 4, md: 12, xs: 12 }}>
                <HomePageToolkit tools={tools} />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{
              marginTop: '9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            size={{ lg: 12 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3em',
                gap: '10px',
              }}
            >
              {' '}
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2em',
                  fontWeight: 'bold',
                }}
              >
                Powered by
              </Typography>
              <img
                src={BackstageLogo}
                alt="backstage logo"
                style={{
                  width: '7.5em',
                  height: '1.5em',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Content>
    </SearchContextProvider>
  );
};
