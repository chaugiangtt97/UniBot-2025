import styled from '@emotion/styled';
import { Box, CircularProgress,Button,IconButton ,  Typography, TextField, Skeleton } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import Grid from '@mui/material/Grid2'
import ChatInput from '~/components/Chatbots/ChatInput';
import ChatBlock from '~/components/Chatbots/ChatBlock';
import Block from '~/components/Mui/Block';
import { useSelector } from 'react-redux';
import { RecommendChatPage } from '~/components/Chatbots/RecommendChatPage';
import ProcessBlock from '~/components/Chatbots/MessageHandler.jsx/ProcessBlock';
import UserTypingMessageBlock from '~/components/Chatbots/MessageHandler.jsx/UserTypingMessageBlock';
import { getSocket } from '~/socket';
import { ChatWithChatbot } from '~/socket/ChatWithChatbot';
import ChatDisplay from '~/components/Chatbots/MessageHandler.jsx/ChatDisplay';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DeleteOutlineOutlined } from '@mui/icons-material';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useOutletContext } from "react-router-dom";
import { useApi } from '~/apis/apiRoute';

function NewChatModal({ modalHandler = null }) {

  const [name , setName] = useState('')
  const [description , setDescription] = useState('')
  const [notice, setNotice] = useState(null)
  const { processHandler, noticeHandler } = useOutletContext();

  useEffect(() => {
    setName('')
    setDescription('')
    setNotice(null)
  },[])

  const newChat = async (e) => {
    e.preventDefault()
    if( name == '' ) {
      setNotice('Vui lòng nhập tên cuộc trò chuyện !')
    } else {
      const sendFeedbackEvent = processHandler.add('#sendFeedback')
      await modalHandler.submit({
        name, description
      }).then(() => {
        modalHandler?.close()
      })
      .catch(() => {
        setNotice('Tạo mới không thành công')
      }).finally(() => processHandler.remove('#sendFeedback', sendFeedbackEvent))
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={modalHandler?.state}
        onClose={modalHandler?.close}>
        <DialogTitle sx = {{ color: '#000', display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx = {{ width: '50vw', maxWidth: '450px'}}>
            <OpenInNewIcon/> Tạo Cuộc Trò Chuyện
          </Box>
        </DialogTitle>
        <DialogContent >
          <DialogContentText sx = {{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              inputProps={{ maxLength: 40 }}
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx = {{ 
                '--mui-palette-text-primary': '#000',
                '--mui-palette-common-onBackgroundChannel': '0 0 0'
              }}
              placeholder='Tên Cuộc Trò Chuyện'/>
            <TextField 
              inputProps={{ maxLength: 50 }}
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx = {{ 
                '--mui-palette-text-primary': '#000',
                '--mui-palette-common-onBackgroundChannel': '0 0 0'
              }}
              placeholder='Mô tả Cuộc Trò Chuyện'/>
          </DialogContentText>

          {notice && 
            <DialogContentText sx = {{ paddingTop: 2, display: 'block' }}>
              <Typography component={'span'} variant={'body2'} sx = {{ color: 'red', textAlign: 'end', display: 'block', width: '100%' }}>{notice}</Typography>
            </DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button sx = {{ color: '#000' }} onClick={newChat}>{modalHandler.submitTitle}</Button>
          <Button sx = {{ color: 'red', fontWeight: '900' }} onClick={modalHandler?.close}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const Header = styled(Box) (({theme}) => ({
  [theme.breakpoints.up('xl')]: {
    height: theme.spacing(10),
  },
  background: theme.palette.primary.main,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.1)',
  height: theme.spacing(7),
  width: '100%',
  position: 'absolute',
  right: 0,
  top: '0',
  borderRadius: '15px 15px 0 0 ',
  zIndex: 1,
  paddingLeft: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  gap: 2
}))

const ChatExtension = styled(Box)(({theme}) => ({
  display: 'flex',
  padding: theme.spacing(1),
  paddingRight: theme.spacing(0),
  minHeight: '32px',

  [theme.breakpoints.up('xl')]: {
    minHeight: '62px'
  }
}))

const ChatWindow = styled(Box)(({theme}) => ({
  position: 'absolute',
  bottom: theme.spacing(0),
  padding: theme.spacing(2),
  paddingTop: theme.spacing(0),
  right: theme.spacing(0),
  width: '100%',
  borderRadius: '15px'
}))

export function ChatGenerator() {
  const bottomRef = useRef(null);
  const user = useSelector((state) => state.auth.user)
  const token = useSelector(state => state.auth.token)

  const socket = getSocket();

  const [Conservations, setConservations] = useState([])
  const [openCreateChat, setOpenCreateChat] = useState(false)
  const [sessions, setSessions] = useState(null)
  const [currentChatSession, setCurrentChatSession] = useState(null)
  const [apiHandler, setApiHandler] = useState({
    session: false,
    history: false
  })
  const [messageHandler, setMessageHandler] = useState({
    isProcess: false,
    notification: [],
    stream_state: false,
    stream_load: [],
    stream_message: null,
    stream_time: 0,
    duration: 0,
    create_at: null
  })

  useEffect(() => {
    currentChatSession && bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [Conservations]);

  const { dashboard, processHandler, noticeHandler  } = useOutletContext();
  
  useEffect(() => {
    document.title = 'Chatbot - Unibot';
    dashboard.navigate.active(466)
    
    return () => (
      dashboard.navigate.active('#')
    )
    
  }, [])

  useEffect(() => {
    ChatWithChatbot.userMessage(socket, (data) => { 
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data }))
      }
    })

    ChatWithChatbot.isProcessing(socket, (data) => { 
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data }))
      } 
    })

    ChatWithChatbot.Processed(socket, (data) => { 
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data })) 
      }
    })

    ChatWithChatbot.streamMessages(socket, (data) => { 
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, stream_state: true, stream_message: data.messages, ...data })) 
      }
    }) 

    ChatWithChatbot.EndStream(socket, (data) => { 
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, stream_state: false, ...data }))  
      }
    })

    ChatWithChatbot.EndProcess(socket, async (data) => {
      if( currentChatSession && currentChatSession?._id == data?.session_id) {
        setMessageHandler({
          isProcess: false,
          notification: [],
          stream_state: false,
          stream_load: [],
          stream_message: null,
          stream_time: 0,
          duration: 0,
          create_at: null
        })
        setConservations((prevs) => [...prevs, data]) 
      }
    })

    return () => (
      ChatWithChatbot.unsign_all(socket)
    )
  }, [getSocket(), currentChatSession])

  useEffect(() => {
    token && loadChatSessionFromDB().then((chatSessionFromDB) => {
      setSessions(chatSessionFromDB)
    }).catch((err) => {
      noticeHandler.add({
        status: 'error',
        message: err
      })
    })
  }, [token])

  const loadChatSessionFromDB = async () => {
    setApiHandler(prev => ({...prev, session: true}))
    return useApi.get_chat_session(token).then((chatSessionFromDB) => {
      setApiHandler(prev => ({...prev, session: false}))
      return chatSessionFromDB
    }).catch((err) => {
      setApiHandler(prev => ({...prev, session: false}))
      noticeHandler.add({
        status: 'error',
        message: err
      })
      return null
    })
  }

  const loadHistoryBySession = async (session) => {
    setApiHandler(prev => ({...prev, history: true}))
    return useApi.get_history_in_chat_session( token, session?._id ).then((sessionWithHistory) => {{
      setApiHandler(prev => ({...prev, history: false}))
      return sessionWithHistory
    }}).catch(() => {
      setApiHandler(prev => ({...prev, history: false}))
      return null
    })
  }
 
  const ChatAction = async (message) => {
    let session
    if(messageHandler.isProcess){
      noticeHandler.add({
        status: 'warning',
        message: 'Tiến trình của bạn đang được thực hiện'
      })
      return 
    }
    const socket = getSocket()
    if(socket == null || socket.connected == false) {
      noticeHandler.add({
        status: 'error',
        message: 'Xin lỗi bạn, Chatbot hiện không hoạt động !'
      })
      return 
    }
    
    setMessageHandler(prev => ({...prev, isProcess: true }))

    try {
      if(currentChatSession == null) {
        session = await newChatAction({ name: message?.question || message, description: new Date() })
      } else {
        session = currentChatSession
      }
    
      if (session?._id){
        setCurrentChatSession(session)
        ChatWithChatbot.chat(socket, { message: message, chat_session: session?._id, 
          history: Conservations.slice(0,3).map((Conservation) => ({
            update_at: Conservation.update_at,
            create_at: Conservation.create_at,
            question: Conservation.question,
            anwser: Conservation.anwser
          })) 
        })
      } 
    } catch (err) {
      noticeHandler.add({
        status: 'error',
        message: err
      })
    }
  }

  const ChatAction_with_collection = (message, collection) => {
    const socket = getSocket()
    if(socket == null || socket.connected == false) {
      noticeHandler.add({
        status: 'error',
        message: 'Xin lỗi bạn, Chatbot hiện không hoạt động !'
      })
      return 
    }
    try {
      ChatWithChatbot.chat(socket, { message: message, chat_session: currentChatSession?._id, 
        history: Conservations.slice(1,4).map((Conservation) => ({
          update_at: Conservation.update_at,
          create_at: Conservation.create_at,
          question: Conservation.question,
          anwser: Conservation.anwser
        })),
        collection: collection
      })
    } catch (error) {
      noticeHandler.add({
        status: 'error',
        message: error
      })
    }
  }

  const newChatAction = async (data_chat_session) => {
    return useApi.create_chat_session(token, data_chat_session.name, data_chat_session.description).then(async (session) => {
      setSessions(prev => ([session, ...prev]))
      setCurrentChatSession(session)
      const sessionWithHistory = await loadHistoryBySession(session)
      sessionWithHistory && setConservations(sessionWithHistory?.history)
      return session
    }).catch((error) => {
      noticeHandler.add({
        status: 'error',
        message: error
      })
    })
  }

  const [isRcmt, setRcmt] = useState(true)
  const sessionButtonClick = async (session) => {
    if(currentChatSession && session?._id === currentChatSession?._id) return 
    try {
        setCurrentChatSession(session)
        setMessageHandler({
          isProcess: false,
          notification: [],
          stream_state: false,
          stream_load: [],
          stream_message: null,
          stream_time: 0,
          duration: 0,
          create_at: null
        })

        const sessionWithHistory = await loadHistoryBySession(session)
        sessionWithHistory && setConservations(sessionWithHistory?.history)
        if(sessionWithHistory?.in_progress) {
          setMessageHandler(sessionWithHistory.in_progress)
        }
        setRcmt(true)

    } catch (error) {
      noticeHandler.add({
        status: 'error',
        message: error,
        auto: false
      })
      setRcmt(false)
      return error
    }
  }

  const [removeSessionEvent, setRemoveSessionEvent] = useState([])
  const removeChatSessionClick = async (event, session) => {
    event.stopPropagation()
    if(!messageHandler.isProcess) {
      setRemoveSessionEvent(prev => [...prev, session?._id])
      useApi.delete_chat_session(token, session?._id).then((removed_session) => {
        setSessions(prev => prev.filter((session) => session?._id != removed_session?._id))
        noticeHandler.add({
          status: 'success',
          message: 'Xóa cuộc hội thoại thành công !',
        })
        if (currentChatSession?._id == removed_session?._id) {
          setCurrentChatSession(null)
          setConservations([])
          setMessageHandler({
            isProcess: false,
            notification: [],
            stream_state: false,
            stream_load: [],
            stream_message: null,
            stream_time: 0,
            duration: 0,
            create_at: null
          })
        }
      }).catch((err) => {
        noticeHandler.add({
          status: 'error',
          message: 'Xóa cuộc hội thoại thất bại !',
          auto: false
        })}
      )
      .finally(() => setRemoveSessionEvent(prevs => prevs.filter((prev) => prev != session?._id)))

    }
  }

  const rating = async (id, value) => {
    const sendFeedbackEvent = processHandler.add('#sendFeedback')
    await useApi.update_chat_session(token, id, value )
    .then((data) => { setConservations(prev => {
      prev.forEach((prev_consv) => {
        if(prev_consv?._id == data?._id){
          return { ...prev_consv, rating: value }
        }
        return prev_consv
      })
      return prev
    })})
    .catch((err) => {
      noticeHandler.add({
        status: 'error',
        message: err
      })}
    )
    .finally(() => processHandler.remove('#sendFeedback', sendFeedbackEvent))

    return true
  }

  return (<Grid className = 'kietGrid' container spacing={2} sx = {{ height: '100%', width: '100%' }}>
      
      <Grid  size={{ xs: 12, md: 8.5 }}>
        <Block sx = {{ 
          paddingBottom: {xs: '120px !important', xl: '140px !important' }, 
          paddingTop: { xs: '69px !important' , xl: '90px !important' }
        }}>

          <Header> </Header>

          <ChatBlock>
            <Box sx ={{ width: '100%', height: '10px' }}/>

            { (apiHandler.history || !Conservations == null ) && <ChatDisplay loading /> }

            { !apiHandler.history && Conservations && Conservations.length === 0 && !messageHandler.isProcess &&
              <RecommendChatPage loading={!isRcmt || sessions == null}  username = {user?.name} ChatAction = {ChatAction} ChatAction_with_collection={ChatAction_with_collection}/> }

            { !apiHandler.history && Conservations && Conservations.map((conservation) => {
              return <div key={conservation?._id}>
                <ChatDisplay  loading={!isRcmt || sessions == null} conservation = {conservation} user={user} action = {{ 
                  re_prompt: ChatAction,
                  addFeedback: rating,
                  chatWithColllection: ChatAction_with_collection
                }} />
              </div>
            })}

            {
              messageHandler.isProcess && messageHandler?.question && (
                <>
                  <div key={messageHandler?._id}>
                    <ChatDisplay conservation = {messageHandler} user={user}  
                      action = {{ re_prompt : ChatAction }} />
                  </div>
    
                  <ProcessBlock messageHandler={messageHandler}/>
                  <UserTypingMessageBlock messageHandler={messageHandler}/>
                </>
              )
            }

            <div ref={bottomRef} />
          </ChatBlock>

          <ChatWindow>
            <Box sx = {{ borderRadius: '15px', background: theme => theme.palette.primary.main, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <ChatExtension/>
              <Box sx = {{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.1)', background: theme => theme.palette.primary.third, borderRadius: '0 0 15px 15px' }}>
                <ChatInput id = 'FormChat_For_Admin'  disabled = {sessions == null || !isRcmt} handleSubmit = {ChatAction} messageHandler = { messageHandler } />
              </Box>
            </Box>
          </ChatWindow>

        </Block>
      </Grid>

      <Grid  size={{ xs: 3.5, md: 3.5 }} >
        <Block sx = {{ padding: 1, paddingTop: { xs: '69px !important' , xl: '90px !important' }, display: { md: 'block', xs: 'none' } }}>
          <Header/> 
          <Box sx = {{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
            <Typography component='p' sx = {{ fontWeight: '800', fontSize: {xl: '1.625rem'} }}> Cuộc Trò Chuyện </Typography>
          </Box>

          { !apiHandler.session && sessions && <Box sx = {{ height: '100%', maxHeight: { xs: 'calc(100vh - 230px)', xl: 'calc(100vh - 289px)' }, overflow: 'auto', padding: 1 }}> {
            sessions.map((session, index) => (
              <Box key = {session?._id || index * 7561295} 
                sx ={{ width: '100%',
                  background: currentChatSession && session?._id == currentChatSession?._id ? '#c7d3ff !important' :'#00000024', 
                  color: theme => {
                    if(currentChatSession && session?._id == currentChatSession?._id) return '#000 !important'
                    return theme.palette.mode == 'dark' ? '#fff' : '#000'
                  },
                  borderRadius: '10px', marginBottom: 1, padding: 1.5, display: 'flex', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.1)', 
                  '&:hover': { background: theme => theme.palette.mode == 'dark' ? '#00000045' : '#818fb033', color: theme => theme.palette.mode == 'dark' ? '#fff' : '#000' }}}
                  onClick = {async (e) => await sessionButtonClick(session)}>
                <Box >
                  <Typography component='p' sx = {{ fontSize: { xl: '1.225rem' }, width: 'fit-content', maxWidth: { xs: '148px', xl: '305px' }, fontWeight: '400 !important', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_name}</Typography>
                  <Typography component='p' sx = {{ fontSize: { xl: '1.075rem !important', xs: '0.725rem !important' }, width: 'fit-content', maxWidth: '148px', fontWeight: '300 !important', fontSize: '0.725rem !important', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_description}</Typography>
                </Box>
                <IconButton sx = {{ padding: 0.25,  color: theme => theme.palette.mode == 'dark' ? '#ff9b9b' : '#fc0000' }} onClick={async (e) => await removeChatSessionClick(e, session)} >
                  { removeSessionEvent.includes(session?._id) ? <CircularProgress size={20}/> : 
                      <DeleteOutlineOutlined sx = {{ fontSize: '1.225rem', color: 'red' }}/> }
                  </IconButton>
              </Box> ))

            }

            { !apiHandler.session && sessions.length == 0 && <> Không có cuộc trò chuyện </> }
          </Box> }


          { (apiHandler.session || !sessions) && <Box sx = {{ height: '100%', maxHeight: { xs: 'calc(100vh - 230px)', xl: 'calc(100vh - 289px)' }, overflow: 'auto', padding: 1 }}> {
            ['','',''].map((_session, index) => (
              <Skeleton key={ index * 82715 } variant="rounded" height={62} sx = {{ marginBottom: 2, width: '100%', borderRadius: '10px' }} />
            ))
          } </Box> }



          <Box sx = {{ padding: 1, paddingTop: 3 }}>
            <Button 
              variant='contained' sx = {{ fontSize: { xl: '1.225rem' }, background: theme => theme.palette.primary.main }}
              startIcon= {<OpenInNewIcon/>}
              disabled={messageHandler.isProcess}
              onClick={() => setOpenCreateChat(true)}>Tạo Mới Trò Chuyện</Button>
          </Box>
        </Block>
      </Grid>

      <NewChatModal
        modalHandler = {{
          state: openCreateChat,
          close: () => setOpenCreateChat(false),
          submitTitle: 'Tạo Cuộc Trò Chuyện',
          submit: (data) => newChatAction(data)
        }} />
    </Grid>)
  
  
}

export default ChatGenerator
