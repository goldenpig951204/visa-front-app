// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/home");
  }, []);

  return <Spinner />
}
Home.guestGuard = false;
Home.authGuard = false;

export default Home
