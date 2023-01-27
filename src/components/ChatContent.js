import { useState, useEffect } from "react";
import { Box, Avatar, Badge, Typography, TextField, IconButton, Button } from "@mui/material";
import { useAuth } from "src/hooks/useAuth";
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import ChatLog from "src/components/ChatLog";
import Http from "src/services/Http";
import toast from "react-hot-toast";

const ChatWrapperStartChat = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  display: 'flex',
  borderRadius: 1,
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.action.hover
}));

const ChatFormWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderRadius: 8,
  alignItems: 'center',
  boxShadow: theme.shadows[1],
  padding: theme.spacing(1.25, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.paper
}));

const Form = styled('form')(({ theme }) => ({
  padding: theme.spacing(0, 5, 5)
}))

const ChatContent = (props) => {
  const { sender, hidden } = props;
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const getMsgs = async () => {
      let { data } = await Http.get("crms/communications/messages", {
        params: {
          user: user._id,
          sender: sender._id
        }
      });
      setMsgs(data.messages);
    }
    getMsgs();
  }, [sender]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (msg.trim()) {
      let { data } = await Http.post("crms/communications/messages", {
        user: user._id,
        sender: sender._id,
        message: msg.trim()
      });
      if (data.status) {
        setMsgs([...msgs, data.message]);
      } else {
        toast.error(data.msg);
      }
    }
    setMsg("");
  }

  const renderContent = () => {
    if (!Object.keys(sender).length) {
      return (
        <ChatWrapperStartChat sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, height: 'calc(100vh - 170px)' }}>
          <Avatar sx={{ mb: 5, pt: 8, pb: 7, px: 7.5, width: 110, height: 110, boxShadow: 3, '& svg': { color: 'action.active' }, backgroundColor: 'background.paper' }}>
            <Icon icon='mdi:message-outline' fontSize='3.125rem' />
          </Avatar>
        </ChatWrapperStartChat>
      )
    } else {
      return (
        <Box sx={{ flexGrow: 1, width: '100%', height: '100%', backgroundColor: 'action.hover' }}>
          <Box sx={{ py: 3, px: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Badge overlap='circular' anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                  sx={{ mr: 4.5 }}
                  badgeContent={
                    <Box
                      component='span'
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        color: `success.main`,
                        boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                        backgroundColor: `success.main`
                      }}
                    />
                  }
                >
                  <Avatar
                    src="/images/avatars/2.png"
                    alt="Avatar"
                    sx={{ width: 40, height: 40 }}
                  />
                </Badge>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: 'text.secondary' }}>{sender.firstName + " " + sender.lastName}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {sender.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <ChatLog hidden={hidden} msgs={msgs} user={user} contact={sender} />
          <Form onSubmit={sendMessage}>
            <ChatFormWrapper>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={msg}
                  size='small'
                  placeholder='Type your message here…'
                  onChange={e => setMsg(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-input': { pl: 0 }, '& fieldset': { border: '0 !important' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* <IconButton size='small' component='label' htmlFor='upload-img' sx={{ mr: 2.75, color: 'text.primary' }}>
                  <Icon icon='mdi:attachment' fontSize='1.375rem' />
                  <input hidden type='file' id='upload-img' />
                </IconButton> */}
                <Button type='submit' variant='contained'>
                  Send
                </Button>
              </Box>
            </ChatFormWrapper>
          </Form>
        </Box>
      )
    }
  }

  return renderContent();
}

export default ChatContent;
