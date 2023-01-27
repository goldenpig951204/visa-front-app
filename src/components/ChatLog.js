import { useRef, useEffect } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

const PerfectScrollbar = styled(PerfectScrollbarComponent)(({ theme }) => ({
  padding: theme.spacing(5)
}));

const ChatLog = (props) => {
  let { msgs, hidden, user, contact } = props;
  const chatArea = useRef(null);
  useEffect(() => {
    if (msgs && msgs.length) {
      scrollToBottom()
    }
  }, [msgs]);

  const scrollToBottom = () => {
    if (chatArea.current) {
      if (hidden) {
        // @ts-ignore
        chatArea.current.scrollTop = Number.MAX_SAFE_INTEGER
      } else {
        // @ts-ignore
        chatArea.current._container.scrollTop = Number.MAX_SAFE_INTEGER
      }
    }
  }

  const renderChats = () => {
    return msgs.map((item, index) => {
      const isSender = item.user._id === user._id

      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: !isSender ? 'row' : 'row-reverse',
            mb: index !== msgs.length - 1 ? 3.75 : undefined
          }}
        >
          <div>
            <Avatar
              skin='light'
              color='primary'
              sx={{
                width: '2rem',
                height: '2rem',
                fontSize: '0.875rem',
                ml: isSender ? 4 : undefined,
                mr: !isSender ? 4 : undefined
              }}
              {...(!isSender
                ? {
                  src: "/images/avatars/2.png",
                  alt: contact.firstName + " " + contact.lastName
                }
                : {})}
              {...(isSender
                ? {
                  src: "/images/avatars/1.png",
                  alt: user.firstName + " " + user.lastName
                }
                : {})}
            >
              {/* {getInitials(data) : null} */}
            </Avatar>
          </div>

          <Box className='chat-body' sx={{ maxWidth: ['calc(100% - 5.75rem)', '75%', '65%'] }}>
            <Box key={index} sx={{ '&:not(:last-of-type)': { mb: 3.5 } }}>
              <div>
                <Typography
                  sx={{
                    boxShadow: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontSize: '0.875rem',
                    p: theme => theme.spacing(3, 4),
                    ml: isSender ? 'auto' : undefined,
                    borderTopLeftRadius: !isSender ? 0 : undefined,
                    borderTopRightRadius: isSender ? 0 : undefined,
                    color: isSender ? 'common.white' : 'text.primary',
                    backgroundColor: isSender ? 'primary.main' : 'background.paper'
                  }}
                >
                  {item.message}
                </Typography>
              </div>
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSender ? 'flex-end' : 'flex-start'
                }}
              >
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                    : null}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )
    })
  }

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return (
        <Box ref={chatArea} sx={{ p: 5, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>
      )
    } else {
      return (
        <PerfectScrollbar ref={chatArea} options={{ wheelPropagation: false }}>
          {children}
        </PerfectScrollbar>
      )
    }
  }

  return (
    <Box sx={{ height: 'calc(100vh - 310px)' }} >
      <ScrollWrapper>{renderChats()}</ScrollWrapper>
    </Box>
  )
}

export default ChatLog
