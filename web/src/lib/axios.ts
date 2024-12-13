import axios, { AxiosInstance } from "axios";

const BE_URL = import.meta.env.VITE_LOCAL_BE_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BE_URL,
  withCredentials: true
});