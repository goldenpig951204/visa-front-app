import axios from "axios";

const Http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000
});

export default Http;
