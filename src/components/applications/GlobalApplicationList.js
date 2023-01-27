import { useState, useEffect, forwardRef, useRef, Fragment } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, FormControl, FormHelperText, InputLabel, Button, Typography, Chip, Menu, MenuItem, Select, TextField, InputAdornment } from "@mui/material";
import { useAuth } from "src/hooks/useAuth";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { DataGrid } from "@mui/x-data-grid";
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from "react-datepicker";
import InputMask from "react-input-mask";
import Icon from "src/@core/components/icon";
import Http from "src/services/Http";
import { toast } from "react-hot-toast";
import moment from "moment";
import { styled } from '@mui/material/styles'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import { CSVLink } from "react-csv";
import countries from "src/@core/utils/countries.json";

const PerfectScrollbar = styled(PerfectScrollbarComponent)(({ theme }) => ({
  padding: theme.spacing(5)
}));

const CustomInput = forwardRef(({ ...props }, ref) => {
  const { label, readOnly } = props

  return (
    <TextField inputRef={ref} {...props} label={label || ''} {...(readOnly && { inputProps: { readOnly: true } })} />
  )
});

const RowOptions = ({ id, application, assign, viewNote, updateStatus, remove }) => {
  const { user } = useAuth();

  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = event => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleAssign = () => {
    assign(id);
    handleRowOptionsClose();
  }

  const handleView = () => {
    viewNote(application);
    handleRowOptionsClose();
  }

  const handleStatus = (status) => {
    updateStatus(id, status);
    handleRowOptionsClose();
  }

  const handleDelete = () => {
    remove(id);
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
          user.role === "staff" ? [
            <MenuItem key={1} onClick={() => handleStatus(true)} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:book-check' fontSize={20} />
              Approve
            </MenuItem>,
            <MenuItem key={2} onClick={() => handleStatus(false)} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:book-cancel' fontSize={20} />
              Decline
            </MenuItem>] :
            (
              (user.role === "super_admin" || user.role === "admin") ?
                [<MenuItem key={1} sx={{ '& svg': { mr: 2 } }} onClick={handleAssign}>
                  <Icon icon="mdi:calendar-month" fontSize={20} /> Assignment
                </MenuItem>,
                <MenuItem key={2} sx={{ '& svg': { mr: 2 } }} onClick={handleView}>
                  <Icon icon="mdi:eye" fontSize={20} /> View Notes
                </MenuItem>] : null
            )
        }
        {
          user.role === "super_admin" &&
          <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:delete-outline' fontSize={20} />
            Delete
          </MenuItem>
        }
      </Menu>
    </>
  )
}

const GlobalApplicationList = ({ staffs }) => {
  const scrollRef = useRef();
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(10);
  const [applications, setApplications] = useState([]);
  const [isGetData, setIsGetData] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [activeId, setActiveId] = useState(0);
  const [status, setStatus] = useState("approved");
  const [visaPrices, setVisaPrices] = useState([]);
  const [travelTypes, setTravelTypes] = useState([]);
  const [application, setApplication] = useState({});
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);

  const [notes, setNotes] = useState({
    note: "",
    attach: ""
  });

  const defaultStaff = {
    staff: ""
  }

  const assignSchema = yup.object().shape({
    staff: yup.string().required("Staff is required field."),
  });

  const {
    reset: assignReset,
    control: assignControl,
    handleSubmit: assignHandleSubmit,
    formState: { errors: assignErrors }
  } = useForm({
    defaultValues: defaultStaff,
    mode: 'onChange',
    resolver: yupResolver(assignSchema)
  });

  const columns = [{
    flex: 4,
    minWidth: 230,
    field: "_id",
    headerName: "Application Number",
    renderCell: ({ row }) => <Typography noWrap>{row._id}</Typography>
  }, {
    flex: 4,
    minWidth: 250,
    field: "orderNumber",
    headerName: "Order Number",
    renderCell: ({ row }) => <Typography noWrap>{row.orderNumber}</Typography>
  }, {
    flex: 3,
    field: "passportNumber",
    headerName: "Passport Number",
    renderCell: ({ row }) => <Typography noWrap>{row.persons[0].passportNumber}</Typography>
  }, {
    flex: 2,
    field: "firstName",
    headerName: "Name",
    renderCell: ({ row }) => <Typography noWrap>{row.persons[0].firstName}</Typography>
  }, {
    flex: 2,
    field: "lastName",
    headerName: "Surname",
    renderCell: ({ row }) => <Typography noWrap>{row.persons[0].lastName}</Typography>
  }, {
    flex: 3,
    field: "phone",
    headerName: "Phone",
    renderCell: ({ row }) => <Typography noWrap>{row.persons[0].phone}</Typography>
  }, {
    flex: 1,
    minWidth: 100,
    field: "amount",
    headerName: "Amount",
    renderCell: ({ row }) => <Typography noWrap>{row.amount}</Typography>
  }, {
    flex: 3,
    minWidth: 110,
    field: "createdAt",
    headerName: "Submitted Date",
    renderCell: ({ row }) => {
      return <Typography noWrap>{moment(row.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Typography>
    }
  }, {
    flex: 1,
    minWidth: 100,
    field: "status",
    headerName: "Status",
    renderCell: ({ row }) => {
      return <Chip
        skin='light'
        size='small'
        variant="filled"
        label={row.status[0].toUpperCase() + row.status.substring(1)}
        color={row.status == "received" ? "warning" : (row.status == "approved" ? "success" : "error")
        }
        sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
      />
    }
  }, {
    flex: 1,
    field: "action",
    headerName: "Action",
    renderCell: ({ row }) => {
      return user.role !== "agent" ? <RowOptions
        id={row._id}
        application={row}
        assign={onAssign}
        viewNote={onViewNote}
        updateStatus={onUpdate}
        remove={onDelete} />
        : null
    }
  }];
  useEffect(() => {
    const getVisaPrices = async () => {
      let { data } = await Http.get("visa/agent-visa-prices");
      setVisaPrices(data);
    }

    const getTravelTypes = async () => {
      let { data } = await Http.get("visa/travel-types");
      setTravelTypes(data);
    }
    getVisaPrices();
    getTravelTypes();

  }, []);

  useEffect(() => {
    const getApplications = async () => {
      let { data } = await Http.get("/crms/applications", {
        params: {
          userId: user._id,
          by: "global"
        }
      });
      setApplications(data);
    }
    getApplications();
  }, [isGetData]);

  const onAssign = async (id) => {
    setActiveId(id);
    let { data } = await Http.get(`crms/applications/${id}/assign`);
    if (data) assignReset({ staff: data.staff });
    setShowAssignModal(true);
  }

  const onAssignSubmit = async (staff) => {
    let { data } = await Http.put(`crms/applications/${activeId}/assign`, staff);
    if (data.status) {
      toast.success(data.msg);
      assignReset();
      setShowAssignModal(false);
    } else {
      toast.error(data.msg);
    }
  }

  const onViewNote = (application) => {
    setApplication(application);
    setShowViewNoteModal(true);
  }

  const onUpdate = async (id, status) => {
    setActiveId(id);
    setStatus(status ? "approved" : "declined");
    setShowNoteModal(true);
  }

  const onStatusUpdate = async (ev) => {
    ev.preventDefault();
    if (notes.note === "") {
      toast.error("Please put down the note.");
    } else {
      let formData = new FormData();
      formData.append("note", notes.note);
      formData.append("status", status);
      if (notes.attach instanceof File) formData.append("attach", notes.attach);

      let { data } = await Http.put(`crms/applications/${activeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (data.status) {
        setShowNoteModal(false);
        setIsGetData(!isGetData);
        toast.success(data.msg);
      } else {
        toast.error(data.msg);
      }
    }
  }

  const onDelete = async (id) => {
    let { data } = await Http.delete(`crms/applications/${id}`);
    if (data.status) {
      toast.success(data.msg);
      setIsGetData(!isGetData);
    } else {
      toast.error(data.msg);
    }
  }

  const detailApplication = (data) => {
    setApplication(data.row);
    setShowApplicationDetail(true);
  }

  return (
    <Box>
      <Button variant="contained" size="small" sx={{ mb: 3 }} startIcon={<Icon icon="mdi:file-download" />}>
        <CSVLink style={{ textDecoration: 'none', color: '#fafafa' }} filename={"applications.csv"} data={applications.map((application, idx) => {
          return {
            id: application._id,
            orderNumber: application.orderNumber,
            passportNumber: application.persons[0].passportNumber,
            firstName: application.persons[0].firstName,
            lastName: application.persons[0].lastName,
            phone: application.persons[0].phone,
            amount: application.amount,
            submittedDate: moment(application.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            status: application.status
          };
        })} headers={[
          { label: "Application number", key: "id" },
          { label: "Order number", key: "orderNumber" },
          { label: "Passport number", key: "passportNumber" },
          { label: "First name", key: "firstName" },
          { label: "Last name", key: "lastName" },
          { label: "Phone", key: "phone" },
          { label: "Amount", key: "amount" },
          { label: "Submitted date", key: "submittedDate" },
          { label: "Status", key: "status" }
        ]}>Export to CSV</CSVLink>
      </Button>
      <DataGrid
        autoHeight
        rows={applications}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        getRowId={application => application._id}
        onRowClick={detailApplication}
        sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
      />
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => { }} open={showAssignModal}>
        <DialogTitle>
          Choose a sub user to deal with this application
          <IconButton
            onClick={() => setShowAssignModal(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 6 }}>
          <form onSubmit={assignHandleSubmit(onAssignSubmit)} style={{ paddingTop: 8 }}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel htmlFor='sub-user'>
                Staff
              </InputLabel>
              <Controller
                id="sub-user"
                name='staff'
                control={assignControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    label='Staff'
                    onChange={onChange}
                    error={Boolean(assignErrors.staff)}
                  >
                    {
                      staffs.map((staff, idx) => (
                        <MenuItem key={idx} value={staff._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography>{staff.firstName + " " + staff.lastName}</Typography>
                          <Typography variant="body2" sx={{ color: "text.disabled" }}>{staff.email}</Typography>
                        </MenuItem>
                      ))
                    }
                  </Select>
                )}
              />

              {assignErrors.staff && (
                <FormHelperText sx={{ color: 'error.main' }}>{assignErrors.staff.message}</FormHelperText>
              )}
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
                onClick={() => setShowAssignModal(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowNoteModal(false)} open={showNoteModal}>
        <DialogTitle>
          Update Status
          <IconButton
            onClick={() => setShowNoteModal(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 6 }}>
          <form onSubmit={onStatusUpdate} style={{ paddingTop: 8 }}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <TextField
                multiline
                rows={4}
                value={notes.note}
                label='Note'
                onChange={ev => setNotes({ ...notes, note: ev.target.value })}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <TextField
                type="file"
                label="Attachment"
                onChange={ev => setNotes({ ...notes, attach: ev.target.files[0] })}
              />
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
                onClick={() => setShowNoteModal(false)}
              >Cancel</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'md'} onClose={() => { setShowApplicationDetail(false) }} open={showApplicationDetail}>
        <DialogTitle>
          Application Detail
          <IconButton
            onClick={() => setShowApplicationDetail(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#aaaaaa'
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <PerfectScrollbar ref={scrollRef} style={{ height: 'calc(100vh - 300px)' }}>
            <DatePickerWrapper>
              <Grid container spacing={5}>
                {
                  Object.keys(application).length ? application.persons.map((person, idx) => {

                    return (
                      <Fragment key={idx}>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <TextField
                            fullWidth
                            label="First name"
                            placeholder="Denys"
                            value={person.firstName}
                            readOnly
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon icon="mdi:account-outline" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <TextField
                            fullWidth
                            label="Last name"
                            placeholder="Lavrynenko"
                            value={person.lastName}
                            readOnly
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon icon="mdi:account-outline" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <TextField
                            fullWidth
                            label="Father's name"
                            placeholder="Alexander"
                            value={person.fatherName}
                            readOnly
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon icon="mdi:account-outline" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <Box>
                            <DatePicker
                              showYearDropdown
                              showMonthDropdown
                              popperPlacement="bottom-start"
                              selected={new Date(person.birthday)}
                              readOnly
                              placeholderText="DD/MM/YYYY"
                              customInput={
                                <CustomInput
                                  fullWidth
                                  label="Date of birthday"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Icon icon="mdi:calendar-month" />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              }
                            />
                          </Box>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <FormControl fullWidth>
                            <InputLabel id="country-label">Country</InputLabel>
                            <Select
                              label="Country"
                              id="country"
                              labelId="country-label"
                              value={person.country}
                              readOnly
                            >
                              {countries.map((country, idx) => <MenuItem key={idx} value={country.abbreviation}>{country.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mt: 3, mb: 3 }}>
                          <InputMask
                            mask="(+44) 999 999 9999"
                            maskChar="_"
                            value={person.phone}
                            readOnly
                          >
                            {() => <TextField
                              fullWidth
                              label="Phone number"
                              placeholder="(+44) 831 623 5660"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Icon icon="mdi:phone" />
                                  </InputAdornment>
                                )
                              }}
                            />}
                          </InputMask>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mb: 3 }}>
                          <FormControl fullWidth>
                            <InputLabel id="prev-nationality-label">Previous Nationally</InputLabel>
                            <Select
                              label="Previous Nationality"
                              id="prev-nationality"
                              labelId="prev-nationlity-label"
                              value={person.prevNationality}
                              readOnly
                            >
                              {countries.map((country, idx) => <MenuItem key={idx} value={country.abbreviation}>{country.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mb: 3 }}>
                          <TextField
                            fullWidth
                            label="Email"
                            placeholder="denys.lavrynenko@gmail.com"
                            value={person.email}
                            readOnly
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon icon="mdi:email-outline" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ mb: 3 }}>
                          <FormControl fullWidth>
                            <InputLabel id="type-of-visa-label">Type of Visa</InputLabel>
                            <Select
                              label="Type of Visa"
                              id="type-of-visa"
                              labelId="type-of-visa-label"
                              value={person.visaType}
                              readOnly
                            >
                              {visaPrices.map((visaPrice, idx) => <MenuItem key={idx} value={visaPrice.visaType._id}>{visaPrice.visaType.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item md={6} sm={6} xs={12} sx={{ mb: 3 }}>
                          <FormControl fullWidth>
                            <InputLabel id="type-of-travel-label">Type of Travel Document</InputLabel>
                            <Select
                              label="Type of Travel Document"
                              id="type-of-travel"
                              labelId="type-of-travel-label"
                              value={person.travelType}
                              readOnly
                            >
                              {travelTypes.map((travelType, idx) => <MenuItem key={idx} value={travelType._id}>{travelType.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item md={6} sm={6} xs={12} sx={{ mb: 3 }}>
                          <TextField
                            fullWidth
                            label="Passport Number"
                            placeholder="7700225VH"
                            value={person.passportNumber}
                            readOnly
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon icon="mdi:passport" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item md={6} sm={6} xs={12} sx={{ mb: 3 }}>
                          <DatePicker
                            showYearDropdown
                            showMonthDropdown
                            selected={new Date(person.issuedDate)}
                            readOnly
                            id="issued-date-input"
                            popperPlacement="bottom-start"
                            placeholderText="MM/DD/YYYY"
                            customInput={<CustomInput
                              fullWidth
                              label="Issued Date"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Icon icon="mdi:calendar-month" />
                                  </InputAdornment>
                                )
                              }}
                            />}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} sx={{ mb: 3 }}>
                          <DatePicker
                            showYearDropdown
                            showMonthDropdown
                            selected={new Date(person.expireDate)}
                            readOnly
                            id="expire-date-input"
                            popperPlacement="bottom-start"
                            placeholderText="MM/DD/YYYY"
                            customInput={<CustomInput
                              fullWidth
                              label="Expire Date"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Icon icon="mdi:calendar-month" />
                                  </InputAdornment>
                                )
                              }}
                            />}
                          />
                        </Grid>
                        <Grid item md={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row' }}>
                            <Box sx={{ borderRadius: 1, marginRight: 4, flexBasis: 170, height: 175, padding: 1, border: '2px solid #585b75', overflow: 'hidden' }}>
                              <img src={`http://localhost:5000/personal_photos/${person.personalPhoto}`} alt="personal_photo" style={{ width: '100%', height: '100%', borderRadius: 5 }} />
                            </Box>
                            <Box sx={{ borderRadius: 1, marginRight: 4, flexBasis: 215, height: 175, padding: 1, border: '2px solid #585b75', overflow: 'hidden' }}>
                              <img src={`http://localhost:5000/passport_photos/${person.passportPhoto}`} alt="passport_photo" style={{ width: '100%', height: '100%', borderRadius: 5 }} />
                            </Box>
                            <TextField
                              sx={{ flex: 1 }}
                              fullWidth
                              multiline
                              readOnly
                              rows={6}
                              label="Note"
                              value={application.note ?? ""}
                            />
                          </Box>
                        </Grid>
                      </Fragment>
                    )
                  }) : null
                }
              </Grid>
            </DatePickerWrapper>
          </PerfectScrollbar>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flex: 1, pt: 0, pb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="contained"
              size="large"
              startIcon={<Icon icon="mdi:close" />}
              onClick={() => setShowApplicationDetail(false)}
            >Close</Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'sm'} onClose={() => setShowViewNoteModal(false)} open={showViewNoteModal}>
        <DialogTitle>
          View Note
          <IconButton
            onClick={() => setShowViewNoteModal(false)}
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: "#aaaaaa"
            }}
          ><Icon icon="mdi:close" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 6 }}>
          <FormControl fullWidth sx={{ mt: 2, mb: 0 }}>
            <TextField
              multiline
              readOnly
              rows={4}
              value={application.note}
              label='Note'
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: application.attach ? 'space-between' : 'flex-end' }}>
          {application.attach && (
            <Button variant="contained" href={`http://localhost:5000/attachments/${application.attach}`} download={true} target="_blank"><Icon icon="mdi:download" /> Attachment</Button>
          )}
          <Button variant="contained" color="error" onClick={() => setShowViewNoteModal(false)}><Icon icon="mdi:close" /> Close</Button>
        </DialogActions>
      </Dialog>
    </Box >
  )
}

export default GlobalApplicationList;
