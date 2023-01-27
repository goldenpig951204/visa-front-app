import { useState, useEffect } from "react";
import { Grid, Card, CardHeader, CardContent, Typography, Box, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, FormControl, FormHelperText, Chip, Menu, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Icon from "src/@core/components/icon";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import InputMask from "react-input-mask";
import AdminLayout from "src/layouts/AdminLayout";
import Http from "src/services/Http";
import toast from "react-hot-toast";

const RowOptions = ({ id, status, permitAdmin, editAdmin, deleteAdmin }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handlePermit = () => {
    permitAdmin(id, status);
    handleRowOptionsClose();
  }

  const handleEdit = () => {
    editAdmin(id);
    handleRowOptionsClose();
  }

  const handleDelete = () => {
    deleteAdmin(id);
    handleRowOptionsClose()
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='mdi:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {
          status ?
            <MenuItem onClick={handlePermit} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:account-lock' fontSize={20} />
              Pause
            </MenuItem> :
            <MenuItem onClick={handlePermit} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:account-lock-open' fontSize={20} />
              Allow
            </MenuItem>
        }
        <MenuItem onClick={handleEdit} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='mdi:pencil-outline' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='mdi:delete-outline' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const Admins = () => {
  const [isGetData, setIsGetData] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [admins, setAdmins] = useState([]);
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [adminId, setAdminId] = useState(0);

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "123456789"
  }

  const newSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    phone: yup
      .string()
      .min(10, 'Phone number must be 10 digits')
      .required(),
    password: yup.string().required()
  });

  const editSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    phone: yup
      .string()
      .min(10, 'Phone number must be 10 digits')
      .required(),
  });

  const columns = [{
    flex: 0.2,
    minWidth: 230,
    field: 'firstName',
    headerName: 'First Name',
    renderCell: ({ row }) => <Typography noWrap>{row.firstName}</Typography>
  },
  {
    flex: 0.2,
    minWidth: 250,
    field: 'lastName',
    headerName: 'Last Name',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap>{row.lastName}</Typography>
      )
    }
  },
  {
    flex: 0.3,
    minWidth: 250,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap>{row.email}</Typography>
      )
    }
  },
  {
    flex: 0.1,
    minWidth: 250,
    field: 'phone',
    headerName: 'Phone',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap>{row.phone}</Typography>
      )
    }
  },
  {
    flex: 0.1,
    minWidth: 100,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => {
      return (
        <Chip
          skin='light'
          size='small'
          variant="filled"
          label={row.status ? 'Approved' : 'Refused'}
          color={row.status ? 'success' : 'warning'}
          sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
        />
      )
    }
  },
  {
    flex: 0.1,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row._id} status={row.status} permitAdmin={permitAdmin} editAdmin={editAdmin} deleteAdmin={onDelete} />
  }];

  useEffect(() => {
    const getAdmins = async () => {
      let { data } = await Http.get("crms/admins", {
        params: {
          search: ""
        }
      });
      setAdmins(data);
    }
    getAdmins();
  }, [isGetData, search, pageSize]);

  const {
    reset: newReset,
    control: newControl,
    handleSubmit: newHandleSubmit,
    formState: { errors: newErrors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(newSchema)
  });

  const {
    reset: editReset,
    control: editControl,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(editSchema)
  });

  const addAdmin = () => {
    setShowNewAdmin(true)
  }

  const onSave = async (admin) => {
    let { data } = await Http.post("crms/admins", {
      ...admin,
      role: "admin"
    });
    if (data.status) {
      newReset(defaultValues);
      setShowNewAdmin(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const editAdmin = async (id) => {
    setAdminId(id);
    let { data } = await Http.get(`crms/admins/${id}`)
    editReset({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    });
    setShowEditAdmin(true);
  }

  const permitAdmin = async (id, status) => {
    let { data } = await Http.put(`/crms/admins/${id}`, {
      status: !status
    });
    if (data.status) {
      toast.success(data.msg);
      setIsGetData(!isGetData);
    } else {
      toast.error(data.msg);
    }
  }

  const onUpdate = async (admin) => {
    let { data } = await Http.put(`crms/admins/${adminId}`, admin);
    if (data.status) {
      editReset(defaultValues);
      setShowEditAdmin(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const onDelete = async () => {
    let { data } = await Http.delete(`crms/admins/${adminId}`);
    if (data.status) {
      toast.success(data.msg);
      setIsGetData(!isGetData);
    } else {
      toast.error(data.msg);
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5">Admin Management</Typography>
              <Box sx={{ pl: 0, pr: 0, pt: 0, pb: 0, display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    size="small"
                    value={search}
                    sx={{ mr: 6, mb: 2 }}
                    placeholder="Search Admin..."
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Button sx={{ mb: 2 }} onClick={addAdmin} variant="contained"><Icon icon="mdi:plus" /> Add Admin</Button>
                </Box>
              </Box>
            </Box>
          } />
          <CardContent>
            <DataGrid
              autoHeight
              getRowId={row => row._id}
              rows={admins}
              columns={columns}
              pageSize={pageSize}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            />
          </CardContent>
        </Card>
      </Grid>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowNewAdmin(false)} open={showNewAdmin}>
        <DialogTitle>
          New Admin
          <IconButton
            onClick={() => setShowNewAdmin(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 6 }}>
          <form onSubmit={newHandleSubmit(onSave)} style={{ paddingTop: 8 }}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='firstName'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='First Name'
                    onChange={onChange}
                    placeholder='Denys'
                    error={Boolean(newErrors.firstName)}
                  />
                )}
              />
              {newErrors.firstName && (
                <FormHelperText sx={{ color: 'error.main' }}>{newErrors.firstName.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='lastName'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Last Name'
                    onChange={onChange}
                    placeholder='Lavrynenko'
                    error={Boolean(newErrors.lastName)}
                  />
                )}
              />
              {newErrors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.lastName.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='email'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    placeholder='denys.lavrynenko@gmail.com'
                    error={Boolean(newErrors.email)}
                  />
                )}
              />
              {newErrors.email && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.email.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='phone'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <InputMask
                    mask="(+44) 999 999 9999"
                    maskChar="_"
                    value={value}
                    onChange={onChange}
                  >
                    {() => <TextField
                      type='string'
                      label='Phone'
                      placeholder='8316235660'
                      error={Boolean(newErrors.phone)}
                    />}
                  </InputMask>
                )}
              />
              {newErrors.phone && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.phone.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='password'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type='text'
                    value={value}
                    label='Password'
                    placeholder='a1A!s2S@d3D#'
                    readOnly
                    error={Boolean(newErrors.phone)}
                  />
                )}
              />
              {newErrors.password && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.password.message}</FormHelperText>}
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Icon icon="mdi:content-save" />}
                sx={{ mr: 4 }}
              >Save</Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Icon icon="mdi:delete" />}
                onClick={() => setShowNewAdmin(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowEditAdmin(false)} open={showEditAdmin}>
        <DialogTitle>
          Edit Admin
          <IconButton
            onClick={() => setShowEditAdmin(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 6 }}>
          <form onSubmit={editHandleSubmit(onUpdate)} style={{ paddingTop: 8 }}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='firstName'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='First Name'
                    onChange={onChange}
                    placeholder='Denys'
                    error={Boolean(editErrors.firstName)}
                  />
                )}
              />
              {editErrors.firstName && (
                <FormHelperText sx={{ color: 'error.main' }}>{editErrors.firstName.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='lastName'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Last Name'
                    onChange={onChange}
                    placeholder='Lavrynenko'
                    error={Boolean(editErrors.lastName)}
                  />
                )}
              />
              {editErrors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.lastName.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='email'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    placeholder='denys.lavrynenko@gmail.com'
                    error={Boolean(editErrors.email)}
                  />
                )}
              />
              {editErrors.email && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.email.message}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='phone'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <InputMask
                    mask="(+44) 999 999 9999"
                    maskChar="_"
                    value={value}
                    onChange={onChange}
                  >
                    {() => <TextField
                      type='string'
                      label='Phone'
                      placeholder='8316235660'
                      error={Boolean(editErrors.phone)}
                    />}
                  </InputMask>
                )}
              />
              {editErrors.phone && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.phone.message}</FormHelperText>}
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Icon icon="mdi:content-save" />}
                sx={{ mr: 4 }}
              >Update</Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Icon icon="mdi:delete" />}
                onClick={() => setShowEditAdmin(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

Admins.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Admins;
