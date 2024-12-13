import { create } from "zustand"
import { axiosInstance } from "../lib/axios"

type AuthUserType = {
  name: string,
  email: string,
  image: string
}

type UseAuthStoreType = {
  authUser: AuthUserType | null,
  isLoggingIn: boolean,
  isCheckingAuth: boolean,

  checkAuth: ()=>void,
}

export const useAuthStore = create<UseAuthStoreType>((set, get)=>({
  authUser: null,
  isLoggingIn: false,
  isCheckingAuth: true,

  checkAuth: async ()=>{
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data })
    } catch(error){
      set({ authUser: null })
      console.log('Error while checking auth:', error);
    } finally {
      set({ isCheckingAuth: false });
    }
  }
}))