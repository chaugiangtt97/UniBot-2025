import styled from '@emotion/styled';
import { Card, FormControl, FormLabel, TextField, Typography, Box, FormControlLabel, Button, CircularProgress } from '@mui/material';
import Link from '@mui/material/Link';
import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useApi } from '~/apis/apiRoute';
import { useErrorMessage } from '~/hooks/useMessage';

const SignInCard = styled(Card)(({ theme }) => ({
  minWidth: '500px',
  [theme.breakpoints.up('xl')]: {
    minWidth: '550px',
    minHeight: '500px',
  },
  display: 'flex', flexDirection: 'column',
  alignSelf: 'center', width: '90vw',
  padding: theme.spacing(4), gap: theme.spacing(2),
  margin: 'auto', background: '#fff', borderRadius: '20px',
  [theme.breakpoints.up('sm')]: { maxWidth: '420px' },
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px'
}));

const TextInput = styled(TextField)(({ theme }) => ({
  '& input': { color: '#000' }, WebkitTextFillColor: '#000',
  '&:hover fieldset': { borderColor: `${theme.palette.primary.main} !important` }
}));
import { useTranslation } from 'react-i18next';
function VerifyEmail() {
  const [notificationError, setNotification] = useState(null)
  const [notificationSuccess, setNotificationSuccess] = useState(null)

  const navigate = useNavigate();
  const { processHandler } = useOutletContext();
  const location = useLocation();
  const email = location.state?.email;
  const { t } = useTranslation();
  if (!email) {
    return <Navigate to="/signin" replace />;
  }
  const validateInputs = () => {

    if (!verificationCode) {
      setNotificationSuccess(null)
      setNotification(t("verify_email.notice.code_required"))//'Mã Không Được Bỏ Trống !'
      return false;
    }

    setNotification(null)
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault()

    const verifyEmail = processHandler.add('#verifyEmail')

    await useApi.email_verify(email, verificationCode)
      .then(() => {
        processHandler.remove('#verifyEmail', verifyEmail)
        navigate('/signin')
      })
      .catch((err) => {
        processHandler.remove('#verifyEmail', verifyEmail)
        setNotification(useErrorMessage(err))
      })
  };

  const [verificationCode, setCode] = useState(null)

  return (
    <>
      <SignInCard variant="outlined">
        <Typography component="h1" variant="h6"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', color: theme => theme.palette.primary.main }} >
          {t("verify_email.account")}</Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, position: 'relative', color: theme => theme.palette.primary.main }} >

          <FormControl sx={{ gap: 1 }}>
            <FormLabel htmlFor="_id" sx={{ color: 'inherit' }}>{t("verify_email.verification_code_label")}</FormLabel>
            <TextInput onChange={(e) => setCode(e.target.value)} id="_id" type="_id" name="_id" placeholder="xxx-xxx-xxxxx" value={verificationCode || ''}
              inputProps={{ maxLength: 40 }}
              autoComplete="_id" autoFocus required fullWidth variant="outlined" />
          </FormControl>

          <Button type="submit" fullWidth variant="contained" onClick={validateInputs}
            sx={{ background: theme => theme.palette.primary.main, '&:hover': { boxShadow: 'var(--mui-shadows-4)' } }} >
            Confirm </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ textAlign: 'center' }}>
              <span>
                <Link
                  // href="/signin"
                  onClick={() => navigate(`/signin`)}
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  {t("verify_email.back_to_login_page")}
                </Link>
              </span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'start', flexDirection: 'column', width: '100%' }}>
            <Typography sx={{ textAlign: 'start', color: '#0bac07' }}>
              {t("verify_email.notice.code_will_be_sent_email")}
            </Typography>
            <Typography sx={{ textAlign: 'start', color: '#0bac07' }}>{t("verify_email.code_note")}
            </Typography>
          </Box>

          <Typography sx={{ width: '100%', textAlign: 'end', color: 'red' }}>
            {notificationError}
          </Typography>
          <Typography sx={{ width: '100%', textAlign: 'end', color: 'green' }}>
            {notificationSuccess}
          </Typography>
        </Box>

      </SignInCard>
    </>
  )
}

export default VerifyEmail
