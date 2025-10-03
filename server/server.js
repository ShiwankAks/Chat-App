import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http'
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoute.js';
import messageRouter from './routes/messageRoute.js';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000

// Create http and express server
const app = express();
const server = http.createServer(app);

// Initialize socket io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

// store online users
// {userId: socketId}
export const userSocketMap = {} ; 

// Socket io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user connected",userId);
    console.log("Socket connected:", socket.id, "userId:", socket.handshake.query.userId);

    if (userId) userSocketMap[userId]= socket.id;

    // Emit online users 
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
        
    socket.on("disconnect",()=>{
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})



// Middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

// Routes setup
app.use("/api/status",(req,res)=>{ res.send("Server is live")});
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);



// Connect MongoDB
await connectDB()

server.listen(PORT,()=>{
    console.log("Server is running on PORT : "+ PORT);
})