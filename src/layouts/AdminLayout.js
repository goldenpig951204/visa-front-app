import React, { useEffect } from "react";
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

const AdminLayout = ({ children, contentHeightFixed }) => {
  const { settings, saveSettings } = useSettings();
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  useEffect(() => {
    saveSettings({ ...settings, mode: "dark" });
  }, []);
  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems()
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
    >
      {children}
    </Layout>
  )
}

export default AdminLayout
