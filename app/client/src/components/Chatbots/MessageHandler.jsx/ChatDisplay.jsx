import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Skeleton, Tooltip, Typography } from '@mui/material'
import { BubbleRight } from '../MessageEffect/BubbleRight'
import { BubbleLeft } from '../MessageEffect/BubbleLeft'
import { getTime } from '~/utils/GetTime'
import ReactMarkdown from 'react-markdown';
import NotifycationModal from '~/components/Mui/NotifycationModal'
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import CloseIcon from '@mui/icons-material/Close';
import botAvatar from '~/assets/botAvatar.png'
import userAvatar from '~/assets/userAvatar.png'
import FadeIn from 'react-fade-in';

export const ChatBlock_Style = {
  width: '100%',
  textAlign: 'justify',
  transition: '0.5s all ease-in',
}

export const ChatDisplay_Style = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'end',
  flexDirection: 'row-reverse',
  textAlign: 'justify',
  paddingBottom: '20px',
  background: 'transparent'
}

export const ChatMessage = styled(Box) (({theme}) => ({
  borderRadius: '5px',
  padding: theme.spacing(0.725),
  paddingRight:  theme.spacing(1.25),
  paddingLeft:  theme.spacing(1.25),
  position: 'relative',
  width: 'fit-content',
  height: 'fit-content',
  minWidth: '200px',
  transform: 'scale(1)',
  transition: '0.5s all ease',

  [theme.breakpoints.up('xl')]: {
    fontSize: '1.225rem',
    padding: theme.spacing(1.225),
    paddingRight:  theme.spacing(2),
    paddingLeft:  theme.spacing(2),
  }
}))

const ModelButton_Style = {
  padding: '3px 10px',
  width: 'fit-content',
  background: 'var(--mui-palette-action-disabled)',
  color: '#fff',
  borderRadius: '8px',
  cursor: 'pointer',
  '&:active': { transform: 'scale(0.95)' },
  '&:hover': { background: '#00000075' }
}

function ChatDisplay({ loading = null, action = null, user = null , conservation = null }) {

  const [openDetail, setOpenDetail] = useState(false)
  const [openFeedback, setOpenFeedback] = useState(false)
  const [content, setContent] = useState('')

  const collections = [
    { title : 'Thông tin nội quy trường học', key: 'academic_affairs' },
    { title : 'Thông tin thời khóa biểu', key: 'timetable' },
    { title : 'Thông tin sự kiện', key: 'events' },
    { title : 'Thông tin tuyển dụng', key: 'recruitment' },
    { title : 'Thông tin học bổng', key: 'scholarship' }
  ]

  const [value, setValue] = React.useState(conservation?.rating);
  const [hover, setHover] = React.useState(-1);

  const feedback = async (value) => {
    await action.addFeedback( conservation._id, { rating: value })
    setValue(value)
  }

  return loading ? (
    <Box sx = {ChatBlock_Style}>
      {['',''].map(( _data, index) => ( <FadeIn key = {1793*index}>
        <Box sx = { ChatDisplay_Style }  key = {17934234*index}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rounded" height={60} sx = {{ width: '100%', marginRight: '20px', maxWidth: '50%'}}/>
        </Box>

        <Box sx = {{ ...ChatDisplay_Style, justifyContent: 'start' }}>
          <Skeleton variant="rounded" height={60} sx = {{ width: '100%', marginLeft: '20px', maxWidth: '70%'}}/>
          <Skeleton variant="circular" width={40} height={40} />
        </Box> </FadeIn>
      ))}

    </Box>
  ) : (
    <Box sx = {ChatBlock_Style}>
      <FadeIn>
        <Box sx = { ChatDisplay_Style }>
          <AvatarUserDefault sx = {{ display: { xs: 'none', md: 'block' } }} />
          <ChatMessage sx = {{   
              background: 'linear-gradient(45deg, rgba(73,124,246,1) 47%, rgba(144,95,247,1) 100%)',
              marginRight: {md: '20px', xs: 0},
              color: '#fff',
              maxWidth: { xs: '100%', md: '70%' }
            }}>
            <BubbleRight xs = {{ display: { xs: 'none', md: 'block' } }}/>

            <Typography sx = {{ fontSize: 'inherit', color: 'inherit' }}>
              {conservation?.question}
            </Typography>

            <Box sx = {{  width: '100%', display: 'flex',gap: 1, justifyContent: 'space-between', borderTop: '1px solid #fff', marginTop: 1, paddingTop: 1 }}>
                { conservation.state != 'in progress' ? <Tooltip title="re_prompt" placement="bottom">
                  <IconButton 
                    onClick={() => action?.re_prompt && action.re_prompt(conservation?.question)}
                    sx = {{ padding: '1px' }}>
                    <RotateRightOutlinedIcon sx = {{ fontSize: { xl: '24px', xs: '16px'} }}/>
                  </IconButton> 
                </Tooltip> : <CircularProgress size="14px" sx = {{ color: '#fff' }} /> }
                <Typography component='p' sx = {{ fontSize: { xs: '0.725rem !important', xl: '0.925rem !important' }, textAlign: 'end', width: '100%' }}>{getTime((conservation?.create_at ? conservation.create_at : conservation?.createdAt))}</Typography>
            </Box>
          </ChatMessage>
        </Box>
      </FadeIn>

      { conservation.state == 'request' && <FadeIn> <Box sx = {{ ...ChatDisplay_Style, justifyContent: 'start' }}>
          <ChatMessage sx = {{   
              marginLeft: {md: '20px', xs: 0},
              background: 'linear-gradient(319deg, rgb(255 255 255) 0%, rgb(186 173 255) 100%)',
              color: '#000',
              maxWidth: { xs: '100%', md: '70%' }
            }}>
            { typeof conservation?.anwser === "string" && <ReactMarkdown>
              Hello! To assist you in the best possible way, could you please let me know which topic you’re interested in from the list below?
            </ReactMarkdown> }
            <BubbleLeft xs = {{ display: { xs: 'none', md: 'block' } }}/>

            <Box sx = {{  width: '100%', borderTop: '1px solid #000', marginTop: 1, paddingTop: 1 }}>
              <Box sx = {{  display: 'flex', flexWrap: 'wrap', gap: 1, paddingBottom: 1, rowGap: '4px' }}>
                {collections.map((data, zIndex) => {
                  return <Box key = {zIndex*123478931} sx = {ModelButton_Style} 
                  onClick = {() => action?.chatWithColllection(conservation?.question, data.key)}
                  >{data.title}</Box>
                })}
              </Box>
              <Box sx = {{ width: '100%', display: 'flex' , justifyContent: 'end', alignItems: 'center'}}>
                <Button startIcon={<CloseIcon/>} color='error' sx = {{ fontSize: { xs: '0.725rem !important', md: '1.225rem !important' } }}>Exit</Button>
              </Box>
            </Box>

          </ChatMessage>
          <Avatar alt="ChatBot" sx = {{ display: { xs: 'none', md: 'block' } }} src={botAvatar} />
        </Box> </FadeIn>
      }

      { conservation.state == 'success' && <FadeIn> <Box sx = {{ ...ChatDisplay_Style, justifyContent: 'start' }}>
          <ChatMessage sx = {{   
              marginLeft: {md: '20px', xs: 0},
              background: 'linear-gradient(319deg, rgb(255 255 255) 0%, rgb(186 173 255) 100%)',
              color: '#000',
              textAlign: 'start',
              maxWidth: { xs: '100%', md: '70%' }
            }}>
            { typeof conservation?.anwser === "string" && <ReactMarkdown>
              { conservation?.anwser }
            </ReactMarkdown> }
            <BubbleLeft xs = {{ display: { xs: 'none', md: 'block' } }}/>

            <Box sx = {{  width: '100%', borderTop: '1px solid #000', marginTop: 1, paddingTop: 1 }}>
              <Box sx = {{  display: 'flex', flexWrap: 'wrap', gap: 1, rowGap: '4px', alignItems: 'center' }}>
                <Typography sx = {{ fontSize: {xs: '0.825rem', xl: '1.325rem' }, fontWeight: '500' }}>References: </Typography>
                {conservation?.source && conservation?.source.map((data, zIndex) => {
                  return <Box key = {zIndex*12650} sx = {ModelButton_Style}
                    onClick = {() => { setOpenDetail(true); setContent(<a href={data?.url} target="_blank" rel="noopener noreferrer" style={{color: '#000', textWrap: 'auto'}}>{data?.url}</a>)  } } > { zIndex + 1 } </Box>
                })}
              </Box>
            </Box>

            <Box sx = {{  width: '100%', borderTop: '1px solid #000', marginTop: 1, paddingTop: 1 }}>
              <Box sx = {{  display: 'flex', flexWrap: 'wrap', gap: 1, rowGap: '4px', alignItems: 'center' }}>
                <Typography sx = {{ fontSize: {xs: '0.825rem', xl: '1.325rem' }, fontWeight: '500' }}>Rate my answer:  </Typography>
                <HoverRating
                  value = {{ value: value, action: feedback }}
                  hover = {{ value: hover, action: setHover }}
                  />
              </Box>
            </Box>

            <Box sx = {{  width: '100%', borderTop: '1px solid #000', marginTop: 1, paddingTop: 1 }}>
              <Typography component='p' sx = {{ fontSize: { xs: '0.725rem !important', xl: '0.925rem !important' }, textAlign: 'end' }}>{getTime(conservation?.create_at ? conservation.create_at : conservation?.createdAt)}</Typography>
            </Box>
          </ChatMessage>
          <Avatar alt="ChatBot" sx = {{ display: { xs: 'none', md: 'block' } }} src={botAvatar} />
        </Box>  </FadeIn>
      }

      { conservation.state == 'failed' && <FadeIn> <Box sx = {{ ...ChatDisplay_Style, justifyContent: 'start' }}>
          <ChatMessage sx = {{   
              marginLeft: {md: '20px', xs: 0},
              background: 'linear-gradient(319deg, rgb(255 255 255) 0%, rgb(186 173 255) 100%)',
              color: '#000',
              textAlign: 'start',
              maxWidth: { xs: '100%', md: '70%' }
            }}>
            { typeof conservation?.anwser === "string" && <ReactMarkdown>
              { conservation?.anwser }
            </ReactMarkdown> }
            <BubbleLeft xs = {{ display: { xs: 'none', md: 'block' } }}/>

            <Box sx = {{  width: '100%', borderTop: '1px solid #000', marginTop: 1, paddingTop: 1 }}>
              <Box sx = {{  display: 'flex', flexWrap: 'wrap', gap: 1, paddingBottom: 1, rowGap: '4px' }}>
                {conservation?.source && conservation?.source.map((data, zIndex) => {
                  return <Box key = {zIndex*12650} sx = {ModelButton_Style}
                    onClick = {() => { setOpenDetail(true); setContent(<a href={data?.url} target="_blank" rel="noopener noreferrer" style={{color: '#000'}}>{data?.url}</a>)  } } > {useCode(data?.collection_name)} </Box>
                })}
              </Box>
              <Typography component='p' sx = {{ fontSize: { xs: '0.725rem !important', xl: '1.925rem' }, textAlign: 'end' }}>{getTime(conservation?.create_at ? conservation.create_at : conservation?.createdAt)}</Typography>
            </Box>
          </ChatMessage>
          <Avatar alt="ChatBot" sx = {{ display: { xs: 'none', md: 'block' } }} src={botAvatar} />
        </Box>  </FadeIn>
      }

      <NotifycationModal
        content={content}
        modalHandler = {{
          state: openDetail,
          close: () => setOpenDetail(false) }}/>

      <FeedbackModal
        modalHandler = {{
          state: openFeedback,
          close: () => setOpenFeedback(false),
          action: (value) => action.addFeedback({rating: value, _id: conservation._id})
        }}
      />
      
    </Box>
  )
}

export default ChatDisplay


function FeedbackModal({ 
  modalHandler = null
}) {

  const [value, setValue] = React.useState(5);
  const [hover, setHover] = React.useState(-1);

  return (
    <React.Fragment>
      <Dialog
        open={modalHandler?.state}
        onClose={modalHandler?.close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant='p'
            >Are you satisfied with the answer?</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" 
          sx = {{ 
            '--mui-palette-text-secondary': '#000'
           }}>
            <HoverRating 
            sx = {{ 
              '--mui-palette-action-disabled': '#0000004d'
             }}
            value = {{ value: value, action: setValue }}
            hover = {{ value: hover, action: setHover }}/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modalHandler?.action(value) && modalHandler?.close()} sx = {{ color: '#000' }}>Confirm</Button>
          <Button onClick={modalHandler?.close} sx = {{ color: 'red' }}> Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { GetURLFromMarkdown } from '~/utils/GetURLFromMarkdown'
import { useCode } from '~/hooks/useMessage'
import AvatarUserDefault from '~/components/Avatar/AvatarUserDefault'
const labels = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Neutral',
  4: 'Good',
  5: 'Very good',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

function HoverRating({value, hover}) {

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Rating
        name="hover-feedback"
        value={value.value}
        precision={1}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          if(!newValue) { return value.action(0) };
          value.action(newValue);
        }}
        onChangeActive={(event, newHover) => {
          if(!newHover) { return hover.action(0) };
          hover.action(newHover);
        }}
        sx = {{ fontSize: { xl: '36px' } }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      <Box sx={{ ml: 2, width: 'fit-content' }}>{labels[hover.hover !== -1 ? hover.value : value.value]}</Box>
    </Box>
  );
}
