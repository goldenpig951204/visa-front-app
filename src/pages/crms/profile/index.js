import { useState, useEffect } from "react";
import { Grid, Card, CardHeader, CardContent, Box, FormControl, TextField, FormHelperText, Button } from "@mui/material";
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Icon from "src/@core/components/icon";
import InputMask from "react-input-mask";
import { useAuth } from 'src/hooks/useAuth'
import Http from "src/services/Http";
import AdminLayout from "src/layouts/AdminLayout";

const Profile = () => {
  const { user } = useAuth();

  const defaultProfile = {
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  }

  const profileSchema = yup.object().shape({
    firstName: yup.string()
      .required("First name is required field."),
    lastName: yup.string()
      .required("Last name is required field."),
    email: yup.string()
      .email("Email is invalid.")
      .required("Email is required field."),
    phone: yup.string()
      .min(10, "Phone number must be 10 digits.")
      .required("Phone number is required field.")
  });

  const {
    reset: profileReset,
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: defaultProfile,
    mode: "onChange",
    resolver: yupResolver(profileSchema)
  });

  const defaultPassword = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  }

  const passwordSchema = yup.object().shape({
    currentPassword: yup.string()
      .required("Current password is required field."),
    newPassword: yup.string()
      .min(8, "Password must be at least 8 characters.")
      .required("New password is required field."),
    confirmPassword: yup.string()
      .test('password-match', 'Passwors must match', function (val) {
        return this.parent.newPassword === val;
      }).required("Confirm password is required field.")
  });

  const {
    reset: passwordReset,
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors }
  } = useForm({
    defaultValues: defaultPassword,
    mode: "onChange",
    resolver: yupResolver(passwordSchema)
  });

  useEffect(() => {
    profileReset(user);
  }, []);

  const updateProfile = async (profile) => {
    let { data } = await Http.put(`crms/auth/profile/${user._id}`, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone
    });
    if (data.status) {
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const changePassword = async (passwords) => {
    let { data } = await Http.put(`crms/auth/password/${user._id}`, {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
    if (data.status) {
      passwordReset();
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item md={6} sm={12}>
        <Card>
          <CardHeader title="Update Profile" />
          <CardContent>
            <form onSubmit={handleProfileSubmit(updateProfile)}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="firstName"
                  control={profileControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="First Name"
                      value={value}
                      onChange={onChange}
                      error={Boolean(profileErrors.firstName)}
                    />
                  )}
                />
                {profileErrors.firstName && (
                  <FormHelperText sx={{ color: 'error.main' }}>{profileErrors.firstName.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="lastName"
                  control={profileControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Last Name"
                      value={value}
                      onChange={onChange}
                      error={Boolean(profileErrors.lastName)}
                    />
                  )}
                />
                {profileErrors.lastName && (
                  <FormHelperText sx={{ color: 'error.main' }}>{profileErrors.lastName.message}</FormHelperText>
                )}
              </FormControl>
              <Grid container spacing={6}>
                <Grid item md={6} sm={12}>
                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <Controller
                      name="email"
                      control={profileControl}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          label="Email"
                          value={value}
                          onChange={onChange}
                          error={Boolean(profileErrors.email)}
                        />
                      )}
                    />
                    {profileErrors.email && (
                      <FormHelperText sx={{ color: 'error.main' }}>{profileErrors.email.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item md={6} sm={12}>
                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <Controller
                      name="phone"
                      control={profileControl}
                      render={({ field: { value, onChange } }) => (
                        <InputMask
                          mask="(+44) 999 999 9999"
                          maskChar="_"
                          value={value}
                          onChange={onChange}
                        >
                          {() =>
                            <TextField
                              label="Phone"
                              placeholder="8316235660"
                              error={Boolean(profileErrors.phone)}
                            />}
                        </InputMask>
                      )}
                    />
                    {profileErrors.phone && (
                      <FormHelperText sx={{ color: 'error.main' }}>{profileErrors.phone.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" size="large" color="primary"><Icon icon="mdi:content-save" style={{ marginRight: 5 }} /> Update</Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={6} sm={12}>
        <Card>
          <CardHeader title="Change Password" />
          <CardContent>
            <form onSubmit={handlePasswordSubmit(changePassword)}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type="password"
                      label="Current Password"
                      value={value}
                      onChange={onChange}
                      error={Boolean(passwordErrors.currentPassword)}
                    />
                  )}
                />
                {passwordErrors.currentPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{passwordErrors.currentPassword.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type="password"
                      label="New Password"
                      value={value}
                      onChange={onChange}
                      error={Boolean(passwordErrors.newPassword)}
                    />
                  )}
                />
                {passwordErrors.newPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{passwordErrors.newPassword.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type="password"
                      label="Confirm Password"
                      value={value}
                      onChange={onChange}
                      error={Boolean(passwordErrors.confirmPassword)}
                    />
                  )}
                />
                {passwordErrors.confirmPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{passwordErrors.confirmPassword.message}</FormHelperText>
                )}
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" size="large" color="primary"><Icon icon="mdi:content-save" style={{ marginRight: 5 }} /> Change</Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

Profile.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Profile;
