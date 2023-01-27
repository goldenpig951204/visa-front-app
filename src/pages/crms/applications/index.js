import { useState, useEffect, useContext } from "react";
import { Grid, Card, CardHeader, CardContent, Tab, Box, Button, Typography, IconButton, Menu, MenuItem, Chip, Dialog, DialogTitle, DialogContent, Select, FormControl, InputLabel, FormHelperText, TextField } from "@mui/material";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import Icon from "src/@core/components/icon";
import AdminLayout from "src/layouts/AdminLayout";
import Http from "src/services/Http";
import GlobalApplicationList from "src/components/applications/GlobalApplicationList";
import AgentApplicationList from "src/components/applications/AgentApplicationList";
import { useAuth } from "src/hooks/useAuth";

const Applications = () => {
  const { user } = useAuth();
  const [staffs, setStaffs] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  useEffect(() => {
    const getStaffs = async () => {
      let { data } = await Http.get("crms/staffs", {
        params: {
          search: true
        }
      });
      setStaffs(data);
    }
    getStaffs();
  }, []);

  const onChangeTab = (ev, newTab) => {
    setActiveTab(newTab);
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={<Typography variant="h5">
            Application Management
            {
              user.role === "agent" && (
                <Box sx={{ float: 'right' }}>
                  <Typography variant="h6">Credit: ${user.balance}</Typography>
                </Box>
              )
            }
          </Typography>} />
          <CardContent>
            {
              user.role !== "agent" ? (
                <TabContext value={activeTab}>
                  <TabList variant="fullWidth" onChange={onChangeTab}>
                    <Tab value="1" label="Applications by global user" />
                    <Tab value="2" label="Applications by agent" />
                  </TabList>
                  <TabPanel value="1">
                    <GlobalApplicationList staffs={staffs} />
                  </TabPanel>
                  <TabPanel value="2">
                    <AgentApplicationList staffs={staffs} />
                  </TabPanel>
                </TabContext>
              ) : <AgentApplicationList staff={staffs} />
            }
          </CardContent>
        </Card>
      </Grid>
    </Grid >
  )
}

Applications.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Applications;
