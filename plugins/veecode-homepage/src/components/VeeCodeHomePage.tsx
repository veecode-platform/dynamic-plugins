import { Box } from '@material-ui/core';
import { HeaderComponent } from './headerComponent/HeaderComponent';
import { HomeGreeting } from './homeGretting/HomeGretting';
import { HomeContent } from './homeContent/HomeContent';

export const VeeCodeHomePage = () => {
  return (
    <Box component="main">
      <HeaderComponent />
      <HomeGreeting />
      <HomeContent />
    </Box>
  );
};
