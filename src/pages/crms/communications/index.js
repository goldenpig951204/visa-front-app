import { useState, useEffect } from "react";
import ChatSidebar from "src/components/ChatSidebar";
import ChatContent from "src/components/ChatContent";
import { Box } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AdminLayout from "src/layouts/AdminLayout"



const Communications = () => {
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down('lg'));
  const [sender, setSender] = useState({});

  const handleChatClick = (id) => {
    setSender(id);
  }

  return (
    <Box className='app-chat' sx={{ width: '100%', display: 'flex', borderRadius: 1, overflow: 'hidden', position: 'relative', backgroundColor: 'background.paper', boxShadow: 6 }}>
      <ChatSidebar hidden={hidden} handleChatClick={handleChatClick} />
      <ChatContent hidden={hidden} sender={sender} />
    </Box>
  )
}

Communications.authGuard = true;
Communications.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Communications;
