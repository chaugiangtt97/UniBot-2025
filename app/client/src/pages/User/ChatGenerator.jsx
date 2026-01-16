import { Box, Button, CircularProgress, IconButton, Skeleton, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import Grid from '@mui/material/Grid2'
import ChatBlock from '~/components/Chatbots/ChatBlock';
import Block from '~/components/Mui/Block';
import { useSelector } from 'react-redux';
import { RecommendChatPage } from '~/components/Chatbots/RecommendChatPage';
import { getSocket } from '~/socket';
import { ChatWithChatbot } from '~/socket/ChatWithChatbot';
import ProcessBlock from '~/components/Chatbots/MessageHandler.jsx/ProcessBlock';
import UserTypingMessageBlock from '~/components/Chatbots/MessageHandler.jsx/UserTypingMessageBlock';
import ChatInput from '~/components/Chatbots/ChatInput';
import styled from '@emotion/styled';
import ChatDisplay from '~/components/Chatbots/MessageHandler.jsx/ChatDisplay';
import { DeleteOutlineOutlined } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';;
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
function NewChatModal({ modalHandler = null }) {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [notice, setNotice] = useState(null)
  const { processHandler } = useOutletContext();
  const { t } = useTranslation();
  useEffect(() => {
    setName('')
    setDescription('')
    setNotice(null)
  }, [])

  const newChat = async (e) => {
    e.preventDefault()
    if (name == '') {
      setNotice(t('enter_conversation_name'))
    } else {
      const sendFeedbackEvent = processHandler.add('#sendFeedback')
      await modalHandler.submit({
        name, description
      }).then(() => {
        modalHandler?.close()
      })
        .catch(() => {
          setNotice(t("user_chatgenerator.creation_failed")) //'Tạo mới không thành công'
        }).finally(() => processHandler.remove('#sendFeedback', sendFeedbackEvent))
    }
  }

  return (
    <React.Fragment>
      <Dialog
        open={modalHandler?.state}
        onClose={modalHandler?.close}>
        <DialogTitle sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ width: '50vw', maxWidth: '450px' }}>
            <OpenInNewIcon /> {t('create_session_title')}
          </Box>
        </DialogTitle>
        <DialogContent >
          <DialogContentText sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              inputProps={{ maxLength: 40 }}
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                '--mui-palette-text-primary': '#000',
                '--mui-palette-common-onBackgroundChannel': '0 0 0'
              }}
              placeholder={t("user_chatgenerator.conversation_name")} />
            <TextField
              inputProps={{ maxLength: 100 }}
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '--mui-palette-text-primary': '#000',
                '--mui-palette-common-onBackgroundChannel': '0 0 0'
              }}
              // sx = {{ 
              //   '& div::before' : { borderBottom: '1px solid #a0a0a0b3' },
              //   '& div::after' : { borderBottom: '1px solid #a0a0a0b3' },
              // }}
              placeholder={t("user_chatgenerator.conversation_description")} />
          </DialogContentText>

          {notice &&
            <DialogContentText sx={{ paddingTop: 2, display: 'block' }}>
              <Typography component={'span'} variant={'body2'} sx={{ color: '#ff2828', textAlign: 'end', display: 'block', width: '100%' }}>{notice}</Typography>
            </DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: '#000' }} onClick={newChat}>{modalHandler.submitTitle}</Button>
          <Button sx={{ color: 'red' }} onClick={modalHandler?.close}>{t("close")}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


const ChatWindow = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(2)
  },
  position: 'absolute',
  bottom: theme.spacing(0),
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1), paddingTop: theme.spacing(0),
  right: theme.spacing(0), width: '100%', borderRadius: '12px'
}))

const BlockStyle = { bgColor_dark: 'rgb(70 77 99)', bgColor_light: 'linear-gradient(180deg, #ffffff 0%, #b3d3fd 100%)' }

import VoicemailOutlinedIcon from '@mui/icons-material/VoicemailOutlined';
import StarIcon from '@mui/icons-material/Star';

export function ChatGenerator() {

  const { t } = useTranslation();

  const bottomRef = useRef(null);
  const socket = getSocket();
  const user = useSelector((state) => state.auth.user)
  const token = useSelector(state => state.auth.token)
  // setFooter
  const { setFooter, menu, mainLayout } = useOutletContext();
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

  const { processHandler, noticeHandler } = useOutletContext();


  useEffect(() => {
    currentChatSession && bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [Conservations, messageHandler.notification]);


  useEffect(() => {

    document.title = 'Chatbot - Unibot'
    mainLayout.navigate(121)

    ChatWithChatbot.userMessage(socket, (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data }))
      }
    })

    ChatWithChatbot.isProcessing(socket, (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data }))
      }
    })

    ChatWithChatbot.Processed(socket, (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, ...data }))
      }
    })

    ChatWithChatbot.streamMessages(socket, (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, stream_state: true, stream_message: data.messages, ...data }))
      }
    })

    ChatWithChatbot.EndStream(socket, (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
        setMessageHandler(prev => ({ ...prev, isProcess: true, stream_state: false, ...data }))
      }
    })

    ChatWithChatbot.EndProcess(socket, async (data) => {
      if (currentChatSession && currentChatSession._id == data?.session_id) {
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
    token && loadChatSessionFromDB()
      .then((chatSessionFromDB) => setSessions(chatSessionFromDB))
      .catch((err) => {
        noticeHandler.add({
          status: 'error',
          message: err
        })
        setSessions([])
      })
  }, [token])

  useEffect(() => {
    menu.setMenu(
      <Block sx={{
        width: '70vw',
        backgroundImage: theme => theme.palette.mode == 'dark' ? BlockStyle.bgColor_dark : BlockStyle.bgColor_light,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
          <Typography component='p' sx={{ fontWeight: '800' }}>{t('chat_list')}</Typography>
        </Box>

        {!apiHandler.session && sessions && <Box sx={{ height: '100%', maxHeight: 'calc(100vh - 152px)', overflow: 'auto', padding: 1 }}> {
          sessions.map((session) => (
            <Box key={session._id}
              sx={{
                width: '100%',
                background: currentChatSession && session?._id == currentChatSession?._id ? '#c7d3ff !important' : '#00000024',
                color: theme => currentChatSession && session?._id == currentChatSession?._id ? '#000 important' : (
                  theme.palette.mode == 'dark' ? '#fff' : '#000'
                ),
                borderRadius: '10px', marginBottom: 1, padding: 1.5, display: 'flex', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.1)',
                '&:hover': { background: theme => theme.palette.mode == 'dark' ? '#00000045' : '#818fb033', color: theme => theme.palette.mode == 'dark' ? '#fff' : '#000' }
              }}
              onClick={async (e) => await sessionButtonClick(session)}>
              <Box>
                <Typography component='p' sx={{ width: 'fit-content', maxWidth: '148px', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_name}</Typography>
                <Typography component='p' sx={{ width: 'fit-content', maxWidth: '148px', fontWeight: '100', fontSize: '0.725rem !important', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_description}</Typography>
              </Box>
              <IconButton color='error' sx={{ padding: 0.25 }} onClick={async (e) => await removeChatSessionClick(e, session)} >
                <DeleteOutlineOutlined sx={{ fontSize: '1.225rem', color: 'red' }} />
              </IconButton>
            </Box>))

        }

          {sessions.length == 0 && <> {t('no_conversations')} </>}
        </Box>}

        {(apiHandler.session || !sessions) && <Box sx={{ height: '100%', maxHeight: 'calc(100vh - 280px)', overflow: 'auto', padding: 1 }}> {
          ['', '', ''].map((_session, index) => (
            <Skeleton key={index * 82715} variant="rounded" height={62} sx={{ marginBottom: 2, width: '100%', borderRadius: '10px' }} />
          ))
        } </Box>}

        <Box sx={{ padding: 1, paddingTop: 3 }}>
          <Button
            variant='contained' color='info'
            startIcon={<OpenInNewIcon />}
            disabled={messageHandler.isProcess}
            onClick={() => setOpenCreateChat(true)}>{t('start_new_chat')}</Button>
        </Box>
      </Block>)

    return () => menu.setMenu(null)
  }, [sessions, currentChatSession])

  const loadChatSessionFromDB = async () => {

    setApiHandler(prev => ({ ...prev, session: true }))
    return useApi.get_chat_session(token)
      .then((chatSessionFromDB) => {
        setApiHandler(prev => ({ ...prev, session: false }))
        return chatSessionFromDB
      }).catch((err) => {
        noticeHandler.add({
          status: 'error',
          message: err
        })
        setApiHandler(prev => ({ ...prev, session: false }))
        return null
      })
  }

  const loadHistoryBySession = async (session) => {
    setApiHandler(prev => ({ ...prev, history: true }))
    return useApi.get_history_in_chat_session(token, session?._id).then((sessionWithHistory) => {
      {
        setApiHandler(prev => ({ ...prev, history: false }))
        return sessionWithHistory
      }
    }).catch(() => {
      setApiHandler(prev => ({ ...prev, history: false }))
      return null
    })
  }

  const ChatAction = async (message) => {
    let session

    if (messageHandler.isProcess) {
      noticeHandler.add({
        status: 'warning',
        message: t("user_chatgenerator.process_in_progress") //'Tiến trình của bạn đang được thực hiện'
      })
      return
    }

    const socket = getSocket()
    if (socket == null || socket.connected == false) {
      noticeHandler.add({
        status: 'error',
        message: t("user_chatgenerator.chatbot_unavailable") //'Xin lỗi bạn, Chatbot hiện không hoạt động !'
      })
      return
    }

    setMessageHandler(prev => ({ ...prev, isProcess: true }))

    try {
      if (currentChatSession == null) {
        session = await newChatAction({ name: message?.question || message, description: new Date() })
      } else {
        session = currentChatSession
      }

      if (session?._id) {
        setCurrentChatSession(session)
        ChatWithChatbot.chat(socket, {
          message: message, chat_session: session?._id,
          history: Conservations.slice(0, 3).map((Conservation) => ({
            update_at: Conservation.update_at,
            create_at: Conservation.create_at,
            question: Conservation.question,
            anwser: Conservation.anwser
          }))
        })
      }
    } catch (error) {
      noticeHandler.add({
        status: 'error',
        message: err
      })
    }

  }

  const ChatAction_with_collection = (message, collection) => {
    const socket = getSocket()
    if (socket == null || socket.connected == false) {
      noticeHandler.add({
        status: 'error',
        message: t("user_chatgenerator.chatbot_unavailable") //'Xin lỗi bạn, Chatbot hiện không hoạt động !'
      })
      return
    }
    try {
      ChatWithChatbot.chat(socket, {
        message: message, chat_session: currentChatSession?._id,
        history: Conservations.slice(1, 4).map((Conservation) => ({
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

  const newChatAction = async (data) => {
    return useApi.create_chat_session(token, data?.name, data?.description).then(async (session) => {
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
    menu.handle(false)
    if (currentChatSession && session._id === currentChatSession._id) return
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
      if (sessionWithHistory?.in_progress) {
        setMessageHandler(sessionWithHistory?.in_progress)
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
    // if(!messageHandler.isProcess) {
    setRemoveSessionEvent(prev => [...prev, session._id])
    useApi.delete_chat_session(token, session._id).then((removed_session) => {
      setSessions(prev => prev.filter((session) => session._id != removed_session._id))
      noticeHandler.add({
        status: 'success',
        message: t("user_chatgenerator.delete_conversation_success") //'Xóa cuộc hội thoại thành công !',
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
    }).catch((error) => {
      noticeHandler.add({
        status: 'error',
        message: t("user_chatgenerator.delete_conversation_failed"), //'Xóa cuộc hội thoại thất bại !',
        auto: false
      })
    })
      .finally(() => setRemoveSessionEvent(prevs => prevs.filter((prev) => prev != session._id)))
    // }
  }

  const rating = async (_id, value) => {
    const sendFeedbackEvent = processHandler.add('#sendFeedback')
    await useApi.update_history_in_chat_session(token, _id, value)
      .then((data) => {
        setConservations(prev => prev.map((prev_consv) => {
          if (prev_consv._id == data._id) return data
          return prev_consv
        }))
      })
      .catch((err) => {
        noticeHandler.add({
          status: 'error',
          message: err
        })
      })
      .finally(() => processHandler.remove('#sendFeedback', sendFeedbackEvent))

    return true
  }

  const [recommendQuestion, setRecommendQuestion] = useState(null)
  const [recommendQuestionPage, setRecommendQuestionPage] = useState(0)

  const [topics, setTopics] = useState(null)

  useEffect(() => {
    !topics && useApi.get_collections().then((data) => {
      const sortedByTimestamp = data.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
      setTopics(sortedByTimestamp)
    })
  }, [topics])

  return (

    <Box sx={{ position: 'relative', width: '100%', height: '100%', paddingTop: { xs: 6, md: 3 }, paddingBottom: { xs: 1.5, md: 2 }, paddingX: { xs: 1.5, md: 2 } }}>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, width: 'fit-content', position: 'absolute', right: '16px', top: '6px' }}>
        <Button onClick={() => menu.handle(true)} sx={{ zIndex: 3, color: theme => theme.palette.text.secondary }} startIcon={<VoicemailOutlinedIcon />}>{t('chat_list')}</Button>
      </Box>
      <Grid container spacing={2} sx={{ height: '100%', '--Grid-rowSpacing': { md: 'calc(2 * var(--mui-spacing))', xs: 1 } }}>

        <Grid size={{ xs: 0, md: 2.3 }} sx={{ height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh', overflow: "auto" }}>
            <Block sx={{
              maxHeight: "calc(-144px + 100vh)",
              height: "100vh",
              padding: '16px !important',
              paddingBottom: '32px !important',
              backgroundImage: theme => theme.palette.mode == 'dark' ? BlockStyle.bgColor_dark : BlockStyle.bgColor_light,
              display: { xs: 'none', md: 'flex' },
              flexDirection: "column",
              justifyContent: "start",
              overflow: 'auto',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, paddingBottom: 0.3 }}>
                <StarIcon sx={{ fontSize: { xs: '28px !important', xl: '42px !important' }, color: '#e7e74e' }} />
                <Typography sx={{ fontSize: { xs: '0.825rem', md: '0.925rem', xl: '1.225rem' }, textAlign: 'start', padding: 1, paddingX: 0.5, fontWeight: '600' }}>{t('user_homepage.table_of_contents')}</Typography>
              </Box>
              {
                // [
                //   'academic_affairs_info',
                //   'school_info',
                //   'scholarship_info',
                //   'event_info',
                //   'recruitment_info',
                //   'timetable_lookup_info',
                //   '', 'abd', 'abd', 'ầ', 'ấdf', 'ấd', 'gfasd', 'adgasdg', 'ádgf', 'faddd'
                // ]
                topics && topics.map((data, zIndex) => ( // topics && topics
                  <>
                    <Button
                      disabled={zIndex === recommendQuestionPage}
                      onClick={() => setRecommendQuestionPage(zIndex)}
                      startIcon={ICON_LIST[zIndex] || zIndex}
                      endIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: { xs: '20px', xl: '32px' } }} />}
                      sx={{ transition: 'none !important', '--mui-palette-action-disabled': '#', width: '100%', justifyContent: 'space-between', fontSize: { xs: '0.725rem', md: '0.775rem', xl: '1.115rem' }, textAlign: 'start', color: 'inherit' }}>
                      {t(data.name)}
                    </Button>

                    {/* {zIndex === recommendQuestionPage && <Box sx={{ maxHeight: zIndex === recommendQuestionPage ? 'auto' : '0px', overflow: 'hidden', borderRadius: '10px', padding: '5px' }}>
                    {
                      RECOMMENDATION_QUESTION[zIndex].map((data, zIndex) => (
                        <Button onClick={() => setRecommendQuestion(data)}
                          sx={{
                            transition: 'none', width: '100%', justifyContent: 'start', textAlign: 'start', color: 'inherit'
                          }}>
                          <Typography component={'span'}
                            sx={{ fontWeight: 400, fontSize: { xs: '0.725rem !important', md: '0.725rem !important', xl: '1.125rem !important' }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: '100%', maxWidth: '100%', textAlign: 'start' }}>
                            {zIndex + 1}. {data} </Typography>
                        </Button>
                      ))
                    }
                  </Box>} */}
                  </>
                ))}
            </Block>
          </Box>
        </Grid>

        <Grid offset={{ xs: 0, md: 0 }} size={{ xs: 12, md: 6.9 }} sx={{ height: '100%' }} >
          <Block sx={{
            paddingBottom: { xl: '130px !important', md: '95px !important', xs: '95px !important' },
            width: '100%',
            backgroundImage: theme => theme.palette.mode == 'dark' ? BlockStyle.bgColor_dark : BlockStyle.bgColor_light
          }}>

            <ChatBlock sx={{
              maxHeight: { xs: 'calc(100vh - 223px)', md: 'calc(100vh - 228px)', xl: 'calc(100vh - 335px)' },
            }}>
              <Box sx={{ width: '100%', height: { xs: '5px', md: '20px' } }}></Box>

              {(apiHandler.history || Conservations == null) && <ChatDisplay loading={true} />}

              {!apiHandler.history && Conservations && Conservations.length === 0 && !messageHandler.isProcess &&
                <RecommendChatPage loading={!isRcmt || sessions == null} username={user?.name} ChatAction={ChatAction} ChatAction_with_collection={ChatAction_with_collection} />}

              {!apiHandler.history && Conservations && Conservations.map((conservation) => {
                return <div key={conservation?._id}>
                  <ChatDisplay conservation={conservation} user={user}
                    action={{
                      re_prompt: ChatAction,
                      addFeedback: rating,
                      chatWithColllection: ChatAction_with_collection
                    }} />
                </div>
              })}

              {messageHandler.isProcess && messageHandler?.question && (
                <>
                  <div key={messageHandler?._id}>
                    <ChatDisplay conservation={messageHandler} user={user}
                      action={{ re_prompt: ChatAction }} />
                  </div>

                  <ProcessBlock messageHandler={messageHandler} />
                  <UserTypingMessageBlock messageHandler={messageHandler} />
                </>
              )}

              <div ref={bottomRef} />
            </ChatBlock>

            <ChatWindow>
              <Box sx={{
                borderRadius: '12px',
                background: theme => theme.palette.primary.main,
              }}>
                <Box sx={{
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25), 0px 1px 2px rgba(0, 0, 0, 0.1)',
                  background: theme => theme.palette.mode == 'dark' ? '#d6d6d685' :
                    theme.palette.primary.third,
                  borderRadius: '12px'
                }}>
                  <ChatInput text={recommendQuestion} id='FormChat_For_User' disabled={sessions == null || !isRcmt} handleSubmit={ChatAction} messageHandler={messageHandler} />
                </Box>
              </Box>

              <Typography sx={{ fontSize: { xs: '10px !important', xl: '16px !important' }, color: theme => theme.palette.mode == 'dark' ? '#fff' : '#000', marginTop: '10px' }}>{t('model_accuracy_notice')}</Typography>
            </ChatWindow>
          </Block>
        </Grid>

        <Grid size={{ xs: 0, md: 2.8 }} sx={{ height: '100%' }}>
          <Block sx={{
            padding: { xs: '8px !important', xl: '24px !important' },
            backgroundImage: theme => theme.palette.mode == 'dark' ? BlockStyle.bgColor_dark : BlockStyle.bgColor_light,
            display: {
              xs: 'none',
              md: 'block'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
              <Typography component='p' sx={{ fontWeight: '800', fontSize: { xl: '1.625rem' } }}>{t('chat_list')}</Typography>
            </Box>

            {!apiHandler.session && sessions && <Box sx={{ height: '100%', maxHeight: { xs: 'calc(100vh - 280px)', xl: 'calc(100vh - 359px)' }, overflow: 'auto', padding: 1 }}> {
              sessions.map((session) => (
                <Button key={session._id}
                  sx={{
                    paddingX: { xl: '24px !important' },
                    paddingY: { xl: '16px !important' },
                    width: '100%',
                    background: theme => {
                      if (theme.palette.mode == 'dark') {
                        if (currentChatSession && session?._id == currentChatSession?._id)
                          return 'linear-gradient(164deg, #0e1c2f 0%, #02041a91 100%)'
                        else
                          return 'linear-gradient(171deg, #45485b 0%, #02041a91 100%)'
                      }

                      if (currentChatSession && session?._id == currentChatSession?._id)
                        return 'linear-gradient(120deg, #005181 0%, #1596e5fa 100%)'

                      return 'linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%)'
                    },
                    transition: 'none',
                    color: theme => {
                      if (currentChatSession && session?._id == currentChatSession?._id) return '#fff'
                      return theme.palette.mode == 'dark' ? '#fff' : '#000'
                    },
                    borderRadius: '10px', marginBottom: { xs: 1, xl: 2 }, padding: 1.5, display: 'flex', justifyContent: 'space-between', cursor: 'pointer',
                    boxShadow: theme => theme.palette.mode == 'dark' ? '0px 2px 4px rgb(178 178 178 / 25%), 0px 1px 2px rgb(255 255 255 / 10%)' : '0px 2px 4px 0px rgb(0 0 0 / 30%)',
                    '&:hover': {
                      color: '#fff !important',
                      background: theme => theme.palette.mode == 'dark' ? 'linear-gradient(164deg, #0e1c2f 0%, #02041a91 100%)' : 'linear-gradient(120deg, #005181 0%, #1596e5fa 100%)',
                    }
                  }}
                  onClick={async (e) => await sessionButtonClick(session)}>
                  <Box >
                    <Typography component='p' sx={{ fontSize: { xl: '1.225rem' }, width: 'fit-content', maxWidth: { xs: '148px', xl: '245px' }, fontWeight: '400 !important', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_name}</Typography>
                    <Typography component='p' sx={{ fontSize: { xl: '1.075rem !important', xs: '0.725rem !important' }, width: 'fit-content', maxWidth: { xs: '148px', xl: '245px' }, fontWeight: '300 !important', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.session_description}</Typography>
                  </Box>
                  <IconButton color='error' sx={{ padding: 0.25 }} disabled={removeSessionEvent.includes(session?._id)}
                    onClick={async (e) => await removeChatSessionClick(e, session)} >
                    {removeSessionEvent.includes(session?._id) ? <CircularProgress size={20} /> :
                      <DeleteOutlineOutlined sx={{ fontSize: { xs: '1.225rem', xl: '1.675rem' }, color: 'red' }} />}
                  </IconButton>
                </Button>))

            }

              {/* {sessions.length == 0 && <> Không có cuộc trò chuyện </>} */}
              {sessions.length == 0 && <> {t('no_conversations')} </>}
            </Box>}

            {(apiHandler.session || !sessions) && <Box sx={{ height: '100%', maxHeight: 'calc(100vh - 280px)', overflow: 'auto', padding: 1 }}> {
              ['', '', ''].map((_session, index) => (
                <Skeleton key={index * 82715} variant="rounded" height={62} sx={{ marginBottom: 2, width: '100%', borderRadius: '10px' }} />
              ))
            } </Box>}

            <Box sx={{ padding: 1, paddingTop: 3 }}>
              <Button
                variant='contained' sx={{ fontSize: { xl: '1.225rem' }, background: theme => theme.palette.primary.main }}
                startIcon={<OpenInNewIcon />}
                onClick={() => setOpenCreateChat(true)}>{t('start_new_chat')}</Button>
            </Box>
          </Block>
        </Grid>

      </Grid>

      <NewChatModal
        modalHandler={{
          state: openCreateChat,
          close: () => setOpenCreateChat(false),
          submitTitle: t('create_session_title'),//'Tạo Cuộc Trò Chuyện',
          submit: (data) => newChatAction(data)
        }} />

    </Box >
  )


}

export default ChatGenerator

import Filter1OutlinedIcon from '@mui/icons-material/Filter1Outlined';
import Filter2OutlinedIcon from '@mui/icons-material/Filter2Outlined';
import Filter3OutlinedIcon from '@mui/icons-material/Filter3Outlined';
import Filter4OutlinedIcon from '@mui/icons-material/Filter4Outlined';
import Filter5OutlinedIcon from '@mui/icons-material/Filter5Outlined';
import Filter6OutlinedIcon from '@mui/icons-material/Filter6Outlined';
import Filter7OutlinedIcon from '@mui/icons-material/Filter7Outlined';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { useApi } from '~/apis/apiRoute';


const ICON_LIST = [<Filter1OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter2OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter3OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter4OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter5OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter6OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />,
<Filter7OutlinedIcon sx={{ fontSize: { xs: '16px !important', xl: '28px !important' } }} />
]

const RECOMMENDATION_QUESTION = [
  ['Tôi có thể tra cứu điểm và bảng điểm ở đâu?',
    'Bao nhiêu điểm học lực Giỏi, Khá, Trung Bình ?',
    'Quy chế đào tạo cho trình độ đại học Trường Đại Học Khoa Học Tự Nhiên, Đại Học Quốc Gia TPHCM',
    'Các Tuyến Xe Buýt Lưu Thông Trong Đại Học Quốc Gia'],

  ['Danh sách học bổng mới nhất năm 2024',
    'Điều kiện nhận học bổng 2024 là gì?',
    'Chương trình học bổng của Ninety Eight 2024'],

  ['Địa điểm tổ chức chương trình Hướng dẫn viết và trình bày báo cáo đề tài án tốt nghiệp 2024',
    'Sự Kiện NTU PEAK ASEAN năm 2024 bắt đầu khi nào ?',
    'Thông Tin Sự Kiện Hack A Day'],

  ['Tuyển dụng thực tập FPT Software [HCM-2023]'],

  ['Lịch thi kết thúc học phần 2 các lớp cao học khóa 32/2022',
    'Thông báo cập nhật lịch học lớp Kỹ năng mềm HK3/2022-2023',
    'Đổi phòng lớp Xử lý phân tích dữ liệu trực tuyến 20_1 HK1/23-24'],

  ['DSHV đăng ký đề tài luận văn Thạc sĩ khóa 31/2021',
    'Thông báo về việc cập nhật thông tin chuyên ngành sinh viên bậc Đại học hệ chính quy – Khóa 2020']
]