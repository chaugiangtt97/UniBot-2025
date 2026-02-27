import styled from '@emotion/styled';
import { Card, FormControl, FormLabel, TextField, Typography, Box, FormControlLabel, Button, CircularProgress, MenuItem, Select } from '@mui/material';
import Link from '@mui/material/Link';
import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useErrorMessage } from '~/hooks/useMessage';

import ReCAPTCHA from 'react-google-recaptcha';
import { useApi } from '~/apis/apiRoute';
import { useTranslation } from 'react-i18next';

const RegisterCard = styled(Card)(({ theme }) => ({
  width: '90vw',
  margin: 'auto',
  display: 'flex',
  minWidth: '500px',
  background: '#fff',
  alignSelf: 'center',
  borderRadius: '20px',
  gap: theme.spacing(2),
  flexDirection: 'column',
  padding: theme.spacing(4),
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',

  [theme.breakpoints.up('sm')]: {
    maxWidth: '420px'
  },

  [theme.breakpoints.up('xl')]: {
    minWidth: '550px',
    minHeight: '500px'
  }
}))

const TextInput = styled(TextField)(({ theme }) => ({
  [theme.breakpoints.up('xl')]: {
    fontSize: '2.225rem'
  },

  WebkitTextFillColor: '#000',
  '& input': {
    color: '#000'
  },
  '&:hover fieldset': {
    borderColor: `${theme.palette.primary.main} !important`
  }
}));

function Register() {
  const [notificationError, setNotification] = useState(null)
  const [userRecord, setUserRecord] = useState(null)

  const navigate = useNavigate();
  const { processHandler, noticeHandler } = useOutletContext();
  const [captchaToken, setCaptchaToken] = useState(null);

  const recaptchaRef = useRef();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const validateInputs = () => {

    if (!captchaToken && import.meta.env.VITE_ENVIRONMENT == 'production') {
      setNotification(t("students_register_page.notice.captcha_required"))

      return false;
    }

    const email = document.getElementById('email')
    const password = document.getElementById('password')

    // const selectedMajor = userRecord?.selectedMajor
    // const trainingProgram = userRecord?.trainingProgram
    // const trainingBatch = userRecord?.trainingBatch

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setNotification(t("students_register_page.notice.email_invalid"))
      return false
    }

    if (!password.value || password.value.length < 6) {
      setNotification(t("students_register_page.notice.password_min_length"))
      return false
    }

    // if (!selectedMajor || selectedMajor == ' ') {
    //   setNotification('Thông tin chuyên ngành không được để trống !')
    //   return false
    // }

    // if (!trainingBatch || trainingBatch == ' ') {
    //   setNotification('Khóa đào tạo không được để trống !')
    //   return false
    // }

    // if (!trainingProgram || trainingProgram == ' ') {
    //   setNotification('Chương trình đào tạo không được để trống !')
    //   return false
    // }

    setNotification(null)
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (notificationError) return


    const formData = new FormData(event.currentTarget)

    const registerEvent = processHandler.add('#register')

    await useApi.register(
      formData.get('email'),
      formData.get('password'),
      formData.get('name'),
      'student',
      {
        trainingProgram: userRecord?.trainingProgram,
        trainingBatch: userRecord?.trainingBatch,
        selectedMajor: userRecord?.selectedMajor
      }, captchaToken)
      .then(() => {
        processHandler.remove('#register', registerEvent)
        noticeHandler.add({
          id: '#542',
          status: 'success',
          message: t('students_register_page.notice.register_success')   // 'Dang ky thanh cong, vui long kiem tra email de xac thuc tai khoan !',
        })
        navigate('/email/verify-email', { state: { email: formData.get('email') } })
      })
      .catch((err) => {
        processHandler.remove('#register', registerEvent)
        setNotification(useErrorMessage(err))
      })
  };
  const reducers_data = useSelector(state => state.reducers)
  const { t, i18n } = useTranslation();
  return (
    <>
      <RegisterCard variant="outlined">
        <Typography component="h1" variant="h6"
          sx={{ width: '100%', fontWeight: 600, fontSize: 'clamp(2rem, 10vw, 2.15rem)', color: theme => theme.palette.primary.main }} >
          {t("students_register_page.heading")} </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, position: 'relative', color: theme => theme.palette.primary.main }} >
          <FormControl sx={{ gap: 1 }}>
            <FormLabel htmlFor="name" sx={{ color: 'inherit' }}>{t("students_register_page.name_label")}</FormLabel>
            <TextInput id="name" type="name" name="name" placeholder={t("students_register_page.name_placeholder")} inputProps={{ maxLength: 25 }}
              required fullWidth autoFocus variant="outlined" />
          </FormControl>

          <FormControl sx={{ gap: 1 }}>
            <FormLabel htmlFor="email" sx={{ color: 'inherit' }}>{t("students_register_page.student_register_email_label")}</FormLabel>
            <TextInput id="email" type="username" name="email" placeholder={t("students_register_page.student_register_email_placeholder")} inputProps={{ maxLength: 40 }}
              autoComplete="email" required fullWidth variant="outlined" />
          </FormControl>

          <FormControl sx={{ gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <FormLabel htmlFor="password" sx={{ color: 'inherit' }}>{t("students_register_page.student_register_password_label")}</FormLabel>
            </Box>
            <TextInput name="password" placeholder="••••••" type="password" id="password" inputProps={{ maxLength: 25 }}
              autoComplete="current-password" required fullWidth variant="outlined"
              sx={{ color: '#000' }} />
          </FormControl>

          {/* <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 2 }}>
            <FormControl sx={{ gap: 1, width: '100%', flex: { xs: '100%', md: '0 0 65%' } }}>
              <FormLabel htmlFor="trainingProgram" sx={{ color: 'inherit', display: 'block', textAlign: 'start' }}>Chương trnh đào tạo</FormLabel>
              <Select
                id="trainingProgram"
                name='trainingProgram'
                value={userRecord?.trainingProgram || ' '}
                onChange={(e) => setUserRecord({ ...userRecord, trainingProgram: e.target.value })}
                defaultValue={'trainingProgram_Viet-Phap'}
                sx={{ width: '100%', color: '#000', '& .MuiSelect-icon': { color: '#000' } }}
              >
                <MenuItem key={'trainingProgram_Dai-Tra'} value={'trainingProgram_Dai-Tra'}>Chương trình Đại Trà</MenuItem>
                <MenuItem key={'trainingProgram_Chat-Luong-Cao'} value={'trainingProgram_Chat-Luong-Cao'}>Chương trình Chất Lượng Cao</MenuItem>
                <MenuItem key={'trainingProgram_Cu_Nhan_Tai_Nang'} value={'trainingProgram_Cu-Nhan-Tai-Nang'}>Chương trình Cử Nhân Tài Năng</MenuItem>
                <MenuItem key={'trainingProgram_Viet-Phap'} value={'trainingProgram_Viet-Phap'}>Chương trình Việt Pháp</MenuItem>
                <MenuItem value=" "></MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ gap: 1, width: '100%', flex: { xs: '100%', md: '1 1 100%' } }}>
              <FormLabel htmlFor="trainingBatch" sx={{ color: 'inherit', display: 'block', textAlign: 'start' }}>Khóa đào tạo</FormLabel>
              <Select
                id="trainingBatch"
                name="trainingBatch"
                value={userRecord?.trainingBatch || ' '}
                onChange={(e) => setUserRecord({ ...userRecord, trainingBatch: e.target.value })}
                defaultValue={'trainingBatch_K25'}
                sx={{ width: '100%', color: '#000', '& .MuiSelect-icon': { color: '#000' } }}
              >
                <MenuItem value={'trainingBatch_K19'} key={'trainingBatch_K19'}>Khóa trước 2020</MenuItem>
                <MenuItem value={'trainingBatch_K20'} key={'trainingBatch_K20'}>Khóa K2020</MenuItem>
                <MenuItem value={'trainingBatch_K21'} key={'trainingBatch_K21'}>Khóa K2021</MenuItem>
                <MenuItem value={'trainingBatch_K22'} key={'trainingBatch_K22'}>Khóa K2022</MenuItem>
                <MenuItem value={'trainingBatch_K23'} key={'trainingBatch_K23'}>Khóa K2023</MenuItem>
                <MenuItem value={'trainingBatch_K24'} key={'trainingBatch_K24'}>Khóa K2024</MenuItem>
                <MenuItem value={'trainingBatch_K25'} key={'trainingBatch_K25'}>Khóa K2025</MenuItem>
                <MenuItem value=" "></MenuItem>
              </Select>
            </FormControl>
          </Box> */}


          {/* <FormControl sx={{ gap: 1 }}>
            <FormLabel htmlFor="selectedMajor" sx={{ color: 'inherit', display: 'block', textAlign: 'start' }}>Chuyên ngành trực thuộc</FormLabel>
            <Select
              id="selectedMajor"
              name="selectedMajor"
              value={userRecord?.selectedMajor || ' '}
              onChange={(e) => setUserRecord({ ...userRecord, selectedMajor: e.target.value })}
              defaultValue={'selectedMajor_Khong-co'}
              sx={{ width: '100%', color: '#000', '& .MuiSelect-icon': { color: '#000' } }}
            >
              <MenuItem key={'selectedMajor_Cong-nghe-phan-mem'} value={'selectedMajor_Cong-nghe-phan-mem'}>Công Nghệ Phần Mềm</MenuItem>
              <MenuItem key={'selectedMajor_He-thong-thong-tin'} value={'selectedMajor_He-thong-thong-tin'}>Hệ Thống Thông Tin</MenuItem>
              <MenuItem key={'selectedMajor_Khoa-hoc-may-tinh'} value={'selectedMajor_Khoa-hoc-may-tinh'}>Khoa Học Máy Tính</MenuItem>
              <MenuItem key={'selectedMajor_Thi-giac-may-tinh'} value={'selectedMajor_Thi-giac-may-tinh'}>Thị Giác Máy Tính</MenuItem>
              <MenuItem key={'selectedMajor_Cong-nghe-tri-thuc'} value={'selectedMajor_Cong-nghe-tri-thuc'}>Công Nghệ Tri Thức</MenuItem>
              <MenuItem key={'selectedMajor_Cong-nghe-thong-tin'} value={'selectedMajor_Cong-nghe-thong-tin'}>Công Nghệ Thông Tin </MenuItem>
              <MenuItem key={'selectedMajor_Khong-co'} value={'selectedMajor_Khong-co'}>Không có - chưa xét chuyên ngành</MenuItem>
              <MenuItem value=" "></MenuItem>
            </Select>
          </FormControl> */}


          <Button type="submit" fullWidth variant="contained" onClick={validateInputs}
            sx={{ background: theme => theme.palette.primary.main, '&:hover': { boxShadow: 'var(--mui-shadows-4)' } }} >
            {t("students_register_page.create_account_button")} </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ textAlign: 'center' }}>
              <span>
                <Link
                  // href="/signin"
                  onClick={() => navigate(`/signin`)}
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  {t("students_register_page.back_to_home")}{/* Trở về đăng nhập */}
                </Link>
              </span>
            </Typography>
{/*             <Typography sx={{ textAlign: 'center' }}> */}
{/*               <span> */}
{/*                 <Link */}
{/*                   // href="/register/lecturer" */}
{/*                   onClick={() => navigate(`/register/lecturer`)} */}
{/*                   variant="body2" */}
{/*                   sx={{ alignSelf: 'center' }} */}
{/*                 > */}
{/*                   {t("students_register_page.lecturer_register_prompt")} */}
{/*                    */}{/* Bạn là giảng viên FIT-HCMUS? */}
{/*                 </Link> */}
{/*               </span> */}
{/*             </Typography> */}
          </Box>


          {reducers_data?.captchaToken && <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <ReCAPTCHA
              sitekey={reducers_data?.captchaToken} // {import.meta.env.VITE_RESCAPTCHA_SITE_KEY}
              data-theme="dark"
              render="explicit"
              onChange={handleCaptchaChange}
              ref={recaptchaRef}
            />
          </Box>}

          <Typography sx={{ width: '100%', textAlign: 'end', color: 'red' }}>
            {notificationError}
          </Typography>
        </Box>

      </RegisterCard>
    </>
  )
}

export default Register
