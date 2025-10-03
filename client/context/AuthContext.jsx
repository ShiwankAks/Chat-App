import { createContext } from "react";
import axios from 'axios'
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import {io} from 'socket.io-client'
import { Navigate, useNavigate } from "react-router-dom";


const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({children})=>{

    const navigate = useNavigate()

    const [token,setToken] = useState(localStorage.getItem("token"))
    const [authUser,setAuthUser] = useState(null)
    const [onlineUsers,setOnlineUsers] = useState([])
    const [socket,setSocket] = useState(null)

    // Check if user is authenticated and can connect to socket
    const checkAuth = async () => {
        try {
            const {data} = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state,credentials) => {
        try {
            const {data} = await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common["token"] = data.token
                setToken(data.token)
                localStorage.setItem("token",data.token)
                toast.success(data.message)
                navigate("/")
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common['token'] = null
        toast.success("Logout Successfully")
        socket.disconnect(); 
    }

    // Update user profile function to handle user profile updates
    const updateProfile = async(body)=>{
        try {
            const {data} = await axios.put("/api/auth/update-profile",body)
            if (data.success) {
                setAuthUser(data.user)
                toast.success("Profile updated Successfully")
                // console.log(body);
                
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Check socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl,{
            query:{
                userId: userData._id,
            }
        });
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds)
        })
        
    }
    
    useEffect(()=>{
        const verify = async()=>{
            if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        await checkAuth()
        }
        verify()
    },[token])

    useEffect(() => {
  if (authUser) {
    navigate("/");
  }
}, [authUser]);


    const value = {
        axios, authUser, onlineUsers, socket, login, logout, updateProfile
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}