import { useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "src/layouts/AdminLayout";
import Spinner from 'src/@core/components/spinner'

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crms/applications");
  }, []);

  return <Spinner />
}

Index.authGuard = false;
Index.getLayout = page => <AdminLayout>{page}</AdminLayout>

export default Index;
