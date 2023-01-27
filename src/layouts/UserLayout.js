import { useEffect } from "react";
import { Box } from '@mui/material';
import { useSettings } from 'src/@core/hooks/useSettings'
import UserHeader from "src/layouts/components/horizontal/Header";
import UserFooter from "src/layouts/components/horizontal/Footer";

const UserLayout = ({ children }) => {
  const { settings, saveSettings } = useSettings()
  useEffect(() => {
    saveSettings({ ...settings, mode: "light" });
  }, []);
  return (
    <Box className="user-container">
      <UserHeader />
      <div className="page-wrapper">
        {children}
        <UserFooter />
      </div>
    </Box>
  )
}

export default UserLayout
