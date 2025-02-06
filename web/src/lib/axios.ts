import axios, { AxiosInstance } from "axios";

const BE_URL = import.meta.env.VITE_LOCAL_BE_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BE_URL,
  withCredentials: true
});

export const uploadTemplate = async (template: string)=>{
  try {

    const res = await axiosInstance.post('/upload/template', {
      template
    })
    
    if (res.status != 200){
     throw new Error(res.data.message || "Unable to upload template!!!"); 
    }

    return res.data;
  } catch(errro){
    // TOAST
  }
}