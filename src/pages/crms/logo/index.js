import { useState, useEffect } from "react";
import { Grid, Card, CardHeader, CardContent, Button, IconButton } from "@mui/material";
import AdminLayout from "src/layouts/AdminLayout";
import Icon from "src/@core/components/icon";
import Http from "src/services/Http";
import toast from "react-hot-toast";

const Logo = () => {
  const [logo, setLogo] = useState("");

  useEffect(() => {
    getLogo()
  }, [])

  const getLogo = async () => {
    let { data } = await Http.get("crms/logo");
    if (data) setLogo(`http://localhost:5000/${data.imageUrl}`);
  }

  const updateLogo = async (ev) => {
    let formData = new FormData();
    formData.append("logo", ev.target.files[0]);

    let { data } = await Http.post('/crms/logo', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    if (data.status) {
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }

    await getLogo();
  }

  const removeLogo = async (img) => {
    let { data } = await Http.delete('/crms/logo');
    if (data.status) {
      setLogo("");
      toast.success(data.msg);
    } else {
      toast.error(data.msg);
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Logo Management" />
          <CardContent>
            <div className="logo-uploader-container">
              <div className="logo-uploader-content">
                <img src={logo} style={{ width: '100%', height: 'auto', maxHeight: 180 }} />
              </div>
              <div className="logo-uploader-actions">
                <IconButton component="label">
                  <input hidden accept="image/*" type="file" onChange={(ev) => updateLogo(ev)} />
                  <Icon icon="mdi:camera" color="#666cffaa" style={{ fontSize: 60 }} />
                </IconButton>
                <IconButton size="small" className="logo-uploader-delete-btn" onClick={removeLogo}>
                  <Icon icon="mdi:delete" color="#666cffaa" />
                </IconButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

Logo.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Logo;
