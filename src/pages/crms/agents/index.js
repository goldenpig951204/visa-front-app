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

const RowOptions = ({ id, status, permitAgent, editAgent, deleteAgent }) => {
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
    permitAgent(id, status);
    handleRowOptionsClose();
  }

  const handleEdit = () => {
    editAgent(id);
    handleRowOptionsClose();
  }

  const handleDelete = () => {
    deleteAgent(id);
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

const agents = () => {
  const [isGetData, setIsGetData] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [agents, setAgents] = useState([]);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [showEditAgent, setShowEditAgent] = useState(false);
  const [agentId, setAgentId] = useState(0);

  const defaultValues = {
    firstName: "",
    lastName: "",
    corpName: "",
    email: "",
    phone: "",
    address: "",
    balance: 100,
    password: "123456789"
  }

  const newSchema = yup.object().shape({
    firstName: yup.string().required("First name is required field."),
    lastName: yup.string().required("Last name is required field."),
    corpName: yup.string().required("Company name is required field."),
    email: yup.string().email("Email is invalid.").required("Email is required field."),
    address: yup.string().required("Address is required field."),
    phone: yup.string().min(10, 'Phone number must be 10 digits').required("Phone number is required field."),
    balance: yup.number("Credit must be numeric").required("Credit is required field."),
    password: yup.string().required("Password is required field.")
  });

  const editSchema = yup.object().shape({
    firstName: yup.string().required("First name is required field."),
    lastName: yup.string().required("Last name is required field."),
    corpName: yup.string().required("Company name is required field."),
    email: yup.string().email("Email is invalid.").required("Email is required field."),
    address: yup.string().required(10, 'Address is required field.'),
    phone: yup.string().min(10, 'Phone number must be 10 digits').required("Phone number is required"),
    balance: yup.number("Credit must be numeric").required("Credit is required field.")
  });

  const columns = [{
    flex: 0.1,
    minWidth: 140,
    field: 'firstName',
    headerName: 'First Name',
    renderCell: ({ row }) => <Typography noWrap>{row.firstName}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 140,
    field: 'lastName',
    headerName: 'Last Name',
    renderCell: ({ row }) => <Typography noWrap>{row.lastName}</Typography>
  }, {
    flex: 0.1,
    minWidth: 150,
    field: 'corpName',
    headerName: 'Company Name',
    renderCell: ({ row }) => <Typography noWrap>{row.corpName}</Typography>
  }, {
    flex: 0.3,
    minWidth: 150,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }) => <Typography noWrap>{row.email}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 200,
    field: 'phone',
    headerName: 'Phone',
    renderCell: ({ row }) => <Typography noWrap>{row.phone}</Typography>
  }, {
    flex: 0.2,
    minWidth: 300,
    field: 'address',
    headerName: 'Address',
    renderCell: ({ row }) => <Typography noWrap>{row.address}</Typography>
  }, {
    flex: 0.1,
    minWidth: 100,
    field: 'balance',
    headerName: 'Credit',
    renderCell: ({ row }) => <Typography noWrap>{row.balance}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 110,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => <Chip
      skin='light'
      size='small'
      variant="filled"
      label={row.status ? 'Approved' : 'Refused'}
      color={row.status ? 'success' : 'warning'}
      sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
    />
  },
  {
    flex: 0.1,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row._id} status={row.status} permitAgent={permitAgent} editAgent={editAgent} deleteAgent={onDelete} />
  }];

  useEffect(() => {
    const getAgents = async () => {
      let { data } = await Http.get("crms/agents", {
        params: {
          search: ""
        }
      });
      setAgents(data);
    }
    getAgents();
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

  const addAgent = () => {
    setShowNewAgent(true)
  }

  const onSave = async (agent) => {
    let { data } = await Http.post("crms/agents", {
      ...agent,
      role: "agent"
    });

    if (data.status) {
      newReset(defaultValues);
      setShowNewAgent(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const editAgent = async (id) => {
    setAgentId(id);
    let { data } = await Http.get(`crms/agents/${id}`)
    console.log(data);
    editReset({
      firstName: data.firstName,
      lastName: data.lastName,
      corpName: data.corpName,
      email: data.email,
      phone: data.phone,
      balance: data.balance
    });
    setShowEditAgent(true);
  }

  const permitAgent = async (id, status) => {
    let { data } = await Http.put(`/crms/agents/${id}`, {
      status: !status
    });
    if (data.status) {
      toast.success(data.msg);
      setIsGetData(!isGetData);
    } else {
      toast.error(data.msg);
    }
  }

  const onUpdate = async (agent) => {
    let { data } = await Http.put(`crms/agents/${agentId}`, agent);
    if (data.status) {
      editReset(defaultValues);
      setShowEditAgent(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const onDelete = async (id) => {
    let { data } = await Http.delete(`crms/agents/${id}`);
    if (data.status) {
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
              <Typography variant="h5">Agent Management</Typography>
              <Box sx={{ pl: 0, pr: 0, pt: 0, pb: 0, display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    size="small"
                    value={search}
                    sx={{ mr: 6, mb: 2 }}
                    placeholder="Search agent..."
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Button sx={{ mb: 2 }} onClick={addAgent} variant="contained"><Icon icon="mdi:plus" /> Add agent</Button>
                </Box>
              </Box>
            </Box>
          } />
          <CardContent>
            <DataGrid
              autoHeight
              getRowId={row => row._id}
              rows={agents}
              columns={columns}
              rowsPerPageOptions={[10, 25, 50]}
              pageSize={pageSize}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            />
          </CardContent>
        </Card>
      </Grid>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowNewAgent(false)} open={showNewAgent}>
        <DialogTitle>
          New Agent
          <IconButton
            onClick={() => setShowNewAgent(false)}
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
            <Grid container spacing={6}>
              <Grid item md={6} sm={12}>
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
              </Grid>
              <Grid item md={6} sm={12}>
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
              </Grid>
            </Grid>
            <Grid container spacing={6}>
              <Grid item md={6} sm={12}>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <Controller
                    name='corpName'
                    control={newControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label='Corp Name'
                        onChange={onChange}
                        placeholder='ANZ MIGRATE'
                        error={Boolean(newErrors.corpName)}
                      />
                    )}
                  />
                  {newErrors.corpName && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.corpName.message}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item md={6} sm={12}>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <Controller
                    name='balance'
                    control={newControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='number'
                        value={value}
                        label='Credit'
                        onChange={onChange}
                        placeholder='100'
                        error={Boolean(newErrors.balance)}
                      />
                    )}
                  />
                  {newErrors.balance && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.balance.message}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name="address"
                control={newControl}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label="Address"
                    onChange={onChange}
                    placeholder="England Creek QLD 4306, Australia"
                    error={Boolean(newErrors.address)}
                  />
                )}
              />
              {newErrors.address && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.address.message}</FormHelperText>}
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
                    error={Boolean(newErrors.password)}
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
                onClick={() => setShowNewAgent(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowEditAgent(false)} open={showEditAgent}>
        <DialogTitle>
          Edit Agent
          <IconButton
            onClick={() => setShowEditAgent(false)}
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
            <Grid container spacing={6}>
              <Grid item md={6} sm={12}>
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
              </Grid>
              <Grid item md={6} sm={12}>
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
              </Grid>
            </Grid>
            <Grid container spacing={6}>
              <Grid item md={6} sm={12}>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <Controller
                    name='corpName'
                    control={editControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label='Corp Name'
                        onChange={onChange}
                        placeholder='ANZ MIGRATE'
                        error={Boolean(editErrors.corpName)}
                      />
                    )}
                  />
                  {editErrors.corpName && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.corpName.message}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item md={6} sm={12}>
                <FormControl fullWidth sx={{ mb: 6 }}>
                  <Controller
                    name='balance'
                    control={editControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='number'
                        value={value}
                        label='Credit'
                        onChange={onChange}
                        placeholder='100'
                        error={Boolean(editErrors.balance)}
                      />
                    )}
                  />
                  {editErrors.balance && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.balance.message}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name="address"
                control={editControl}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label="Address"
                    onChange={onChange}
                    placeholder="England Creek QLD 4306, Australia"
                    error={Boolean(editErrors.address)}
                  />
                )}
              />
              {editErrors.address && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.address.message}</FormHelperText>}
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
                onClick={() => setShowEditAgent(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

agents.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default agents;
