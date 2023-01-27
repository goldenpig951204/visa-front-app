import { useState, useEffect } from "react";
import { Box, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, FormControl, FormHelperText, InputLabel, Select, Menu, MenuItem, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Icon from "src/@core/components/icon";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import toast from "react-hot-toast";
import Http from "src/services/Http";

const RowOptions = ({ id, editPrice, deletePrice }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    editPrice(id);
    handleRowOptionsClose();
  }

  const handleDelete = () => {
    deletePrice(id);
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

const AgentVisaPriceList = ({ visaTypes }) => {
  const [isGetData, setIsGetData] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [prices, setPrices] = useState([]);
  const [showNewPrice, setShowNewPrice] = useState(false);
  const [showEditPrice, setShowEditPrice] = useState(false);
  const [priceId, setPriceId] = useState(0);
  const columns = [{
    flex: 0.7,
    minWidth: 230,
    field: 'visaType',
    headerName: 'Visa Price',
    renderCell: ({ row }) => <Typography noWrap>{row.visa[0].name}</Typography>
  }, {
    flex: 0.7,
    minWidth: 250,
    field: 'price',
    headerName: 'Price',
    renderCell: ({ row }) => {
      return (
        <Typography noWrap>&#163;{row.price}</Typography>
      )
    }
  }, {
    flex: 0.1,
    width: 80,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row._id} editPrice={editPrice} deletePrice={onDelete} />
  }];

  const defaultValues = {
    visaType: "",
    price: 0
  }

  const schema = yup.object().shape({
    visaType: yup.string().required("Visa type is required field."),
    price: yup.number("Price must be numeric").required("Price is required field.")
  });

  const {
    reset: newReset,
    control: newControl,
    handleSubmit: newHandleSubmit,
    formState: { errors: newErrors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  const {
    reset: editReset,
    control: editControl,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const getPrices = async () => {
      let { data } = await Http.get("crms/agent-visa-prices", {
        params: {
          search: search
        }
      });
      setPrices(data);
    }
    getPrices();
  }, [isGetData, search, pageSize]);

  const addPrice = () => {
    newReset({
      visaType: visaTypes[0]._id,
      price: 0
    });
    setShowNewPrice(true)
  }

  const onSave = async (price) => {
    let { data } = await Http.post("crms/agent-visa-prices", price);
    if (data.status) {
      newReset(defaultValues);
      setShowNewPrice(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const editPrice = async (id) => {
    setPriceId(id);
    let { data } = await Http.get(`crms/agent-visa-prices/${id}`)
    editReset({
      visaType: data.visaType,
      price: data.price,
    });
    setShowEditPrice(true);
  }

  const onUpdate = async (price) => {
    let { data } = await Http.put(`crms/agent-visa-prices/${priceId}`, price);
    if (data.status) {
      editReset(defaultValues);
      setShowEditPrice(false);
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  const onDelete = async (id) => {
    let { data } = await Http.delete(`crms/agent-visa-prices/${id}`);
    if (data.status) {
      setIsGetData(!isGetData);
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }
  return (
    <Box>
      <Box sx={{ pl: 0, pr: 0, pt: 0, pb: 0, display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            value={search}
            sx={{ mr: 6, mb: 2 }}
            placeholder="Search visa..."
            onChange={e => setSearch(e.target.value)}
          />
          <Button sx={{ mb: 2 }} onClick={addPrice} variant="contained"><Icon icon="mdi:plus" /> Add Price</Button>
        </Box>
      </Box>
      <DataGrid
        autoHeight
        getRowId={row => row._id}
        rows={prices}
        columns={columns}
        pageSize={pageSize}
        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
      />
            <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowNewPrice(false)} open={showNewPrice}>
        <DialogTitle>
          New Price
          <IconButton
            onClick={() => setShowNewPrice(false)}
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
              <InputLabel id='visa-type' error={Boolean(newErrors.visaType)} htmlFor='visa-type'>
                Visa Type
              </InputLabel>
              <Controller
                id="visa-type"
                name='visaType'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    label='Visa Type'
                    onChange={onChange}
                    error={Boolean(newErrors.visaType)}
                  >
                    {
                      visaTypes.map((visaType, idx) => <MenuItem key={idx} value={visaType._id}>{visaType.name}</MenuItem>)
                    }
                  </Select>
                )}
              />
              {newErrors.visaType && (
                <FormHelperText sx={{ color: 'error.main' }}>{newErrors.visaType.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='price'
                control={newControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Visa Price'
                    onChange={onChange}
                    placeholder='100'
                    error={Boolean(newErrors.price)}
                  />
                )}
              />
              {newErrors.price && <FormHelperText sx={{ color: 'error.main' }}>{newErrors.price.message}</FormHelperText>}
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
                onClick={() => setShowNewPrice(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowEditPrice(false)} open={showEditPrice}>
        <DialogTitle>
          Edit Price
          <IconButton
            onClick={() => setShowEditPrice(false)}
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
              <InputLabel id='visa-type' error={Boolean(editErrors.visaType)} htmlFor='visa-type'>
                Visa Type
              </InputLabel>
              <Controller
                id="visa-type"
                name='visaType'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    readOnly
                    value={value}
                    label='Visa Type'
                    onChange={onChange}
                    error={Boolean(editErrors.visaType)}
                  >
                    {
                      visaTypes.map((visaType, idx) => <MenuItem key={idx} value={visaType._id}>{visaType.name}</MenuItem>)
                    }
                  </Select>
                )}
              />
              {editErrors.visaType && (
                <FormHelperText sx={{ color: 'error.main' }}>{editErrors.visaType.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Controller
                name='price'
                control={editControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Visa Price'
                    onChange={onChange}
                    placeholder='100'
                    error={Boolean(editErrors.price)}
                  />
                )}
              />
              {editErrors.price && <FormHelperText sx={{ color: 'error.main' }}>{editErrors.price.message}</FormHelperText>}
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
                onClick={() => setShowEditPrice(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AgentVisaPriceList;
