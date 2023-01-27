import { useState, useEffect } from "react";
import { Box, Drawer, List, ListItem, ListItemAvatar, Avatar, TextField, InputAdornment, Badge, ListItemButton, Typography, ListItemText, Chip } from "@mui/material";
import { useAuth } from "src/hooks/useAuth";
import Icon from 'src/@core/components/icon'
import PerfectScrollbar from 'react-perfect-scrollbar'
import Http from "src/services/Http"

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const ChatSidebar = (props) => {
  const { hidden, handleChatClick } = props;
  const { user } = useAuth();
  const [activeId, setActiveId] = useState("");
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const getContacts = async () => {
      let { data } = await Http.get("crms/communications/contacts", {
        params: {
          id: user._id
        }
      });
      setContacts(data);
    }
    getContacts();
  }, []);

  const setChannel = (contact) => {
    setContacts(contacts.map(_contact => {
      if (_contact._id === contact._id) _contact.unSeenCount = 0;

      return _contact;
    }));
    setActiveId(contact._id);
    handleChatClick(contact);

  }

  return (
    <Drawer open variant="permanent"
      sx={{
        zIndex: 7, height: '100%', display: 'block', position: 'static', '& .MuiDrawer-paper': {
          boxShadow: 'none', overflow: 'hidden', width: 360, position: 'static', borderTopLeftRadius: theme => theme.shape.borderRadius, borderBottomLeftRadius: theme => theme.shape.borderRadius
        }, '& > .MuiBackdrop-root': {
          borderRadius: 1,
          position: 'absolute', zIndex: theme => theme.zIndex.drawer - 1
        }
      }}
    >
      <Box sx={{ px: 5.5, py: 3.5, display: 'flex', alignItems: 'center', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <Badge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mr: 4.5 }}
          badgeContent={
            <Box
              component='span'
              sx={{
                width: 8, height: 8, borderRadius: '50%', color: `success.main`, backgroundColor: `success.main`, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
              }}
            />
          }
        >
          <Avatar
            src={"/images/avatars/1.png"}
            alt={user.firstName}
            sx={{ width: 40, height: 40, cursor: 'pointer' }}
          />
        </Badge>
        <TextField
          fullWidth
          size='small'
          value={""}
          onChange={() => { }}
          placeholder='Search for contact...'
          sx={{ '& .MuiInputBase-root': { borderRadius: 5 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='mdi:magnify' fontSize='1.25rem' />
              </InputAdornment>
            )
          }}
        />
      </Box>
      <Box sx={{ height: `calc(100vh - 240px)` }}>
        <ScrollWrapper hidden={hidden}>
          <Box sx={{ p: theme => theme.spacing(5, 3, 3) }}>
            <Typography variant='h6' sx={{ ml: 2, mb: 4, color: 'primary.main' }}>
              Contacts
            </Typography>
            <List sx={{ p: 0 }}>
              {contacts.length > 0 &&
                contacts.map((contact, idx) => (
                  <ListItem key={idx} disablePadding sx={{ '&:not(:last-child)': { mb: 1.5 } }}>
                    <ListItemButton
                      disableRipple
                      onClick={() => { setChannel(contact) }}
                      sx={{
                        px: 2.5,
                        py: 2.5,
                        width: '100%',
                        borderRadius: 1,
                        alignItems: 'flex-start',
                        ...(activeId == contact._id && { backgroundColor: theme => `${theme.palette.primary.main} !important` })
                      }}
                    >
                      <ListItemAvatar sx={{ m: 0 }}>
                        <Avatar
                          alt={"Avatar"}
                          src={"/images/avatars/2.png"}
                          sx={{
                            width: 40,
                            height: 40,
                            outline: theme =>
                              `2px solid ${theme.palette.common.white}}`
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{
                          my: 0,
                          ml: 4,
                        }}
                        primary={
                          <Typography sx={{ color: 'text.secondary' }}>
                            {contact.firstName + " " + contact.lastName}
                          </Typography>
                        }
                        secondary={
                          <Typography noWrap variant="body2" sx={{ color: 'text.disabled' }}>
                            {contact.role}
                          </Typography>
                        }
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          flexDirection: 'column',
                          justifyContent: 'flex-start'
                        }}
                      >
                        {
                          contact.unSeenCount ? (
                            <Chip
                              color='error'
                              label={contact.unSeenCount}
                              sx={{
                                mt: 0.5,
                                height: 18,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '& .MuiChip-label': { pt: 0.25, px: 1.655 }
                              }}
                            />
                          ) : null
                        }
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              }
            </List>
          </Box>
        </ScrollWrapper>
      </Box >
    </Drawer >
  )

}

export default ChatSidebar;
