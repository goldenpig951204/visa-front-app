import { useState, useEffect } from "react";
import { Grid, Card, CardHeader, CardContent, Tab, Typography, Box, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, FormControl, FormHelperText, InputLabel, Select, Menu, MenuItem } from "@mui/material";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import AdminLayout from "src/layouts/AdminLayout";
import Http from "src/services/Http";
import GlobalVisaPriceList from "src/components/visa-prices/GlobalVisaPriceList";
import AgentVisaPriceList from "src/components/visa-prices/AgentVisaPriceList";



const VisaPrices = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [visaTypes, setVisaTypes] = useState([]);
  useEffect(() => {
    const getVisaTypes = async () => {
      let { data } = await Http.get("crms/visa-types");
      setVisaTypes(data);
    }
    getVisaTypes();
  }, []);

  const onChangeTab = (ev, newTab) => {
    setActiveTab(newTab);
  }


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5">Visa Prices Management</Typography>
            </Box>
          } />
          <CardContent>
            <TabContext value={activeTab}>
              <TabList variant="fullWidth" onChange={onChangeTab}>
                <Tab value="1" label="Prices for global user" />
                <Tab value="2" label="Prices for agent" />
              </TabList>
              <TabPanel value="1">
                <GlobalVisaPriceList visaTypes={visaTypes}/>
              </TabPanel>
              <TabPanel value="2">
                <AgentVisaPriceList visaTypes={visaTypes}/>
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  )
}

VisaPrices.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default VisaPrices;
