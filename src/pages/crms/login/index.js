import { useState } from 'react'
import Link from 'next/link'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from "src/hooks/useAuth"
import toast from "react-hot-toast";

// ** MUI Components
import {
  Box,
  Button,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  CardContent,
  FormControl,
  OutlinedInput,
  Card as MuiCard,
  InputAdornment,
  FormControlLabel as MuiFormControlLabel,
  FormHelperText
} from '@mui/material'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: 450 }
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const Login = () => {
  const [showPwd, setShowPwd] = useState(false)
  const auth = useAuth()

  const defaultValues = {
    email: '',
    password: '',
    rememberMe: false
  }

  const schema = yup.object().shape({
    email: yup.string().required('Please enter your email.').email('It is not a valid email.'),
    password: yup.string().required('Please enter your password.').min(8, 'Password must be at least 8 characters long.')
  })

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  const handleClickShowPassword = () => {
    setShowPwd(!showPwd)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const onSubmit = async user => {
    auth.login(user, (err) => toast.error(err.msg));
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ p: theme => `${theme.spacing(12, 7, 6.5)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link href="/home"><img src="/images/Group-90white.svg" alt="Logo" style={{ width: 350, height: 40 }} /></Link>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='email'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Email'
                    onChange={onChange}
                    placeholder='user123@gmail.com'
                    error={Boolean(errors.email)}
                  />
                )}
              />
              {errors.email && (
                <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-password'>Password</InputLabel>
              <Controller
                name='password'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <OutlinedInput
                    value={value}
                    label='Password'
                    id='auth-login-password'
                    onChange={onChange}
                    type={showPwd ? 'text' : 'password'}
                    error={Boolean(errors.password)}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          aria-label='toggle password visibility'
                        >
                          <Icon icon={showPwd ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                )}
              />
              {errors.password && <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>}
            </FormControl>
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <FormControl>
                <Controller
                  name='rememberMe'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      label='Remember Me'
                      control={<Checkbox {...field} />}
                      sx={{ '& .MuiFormControlLabel-label': { color: 'text.primary' } }}
                    />
                  )}
                />
              </FormControl>
              <Typography
                variant='body2'
                component={Link}
                href='/crms/forgot-password'
                sx={{ color: 'primary.main', textDecoration: 'none' }}
              >
                Forgot Password?
              </Typography>
            </Box>
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
Login.authGuard = false;
Login.setConfig = () => {
  return {
    mode: 'dark'
  }
}
Login.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default Login
