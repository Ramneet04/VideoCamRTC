const express = require("express");
const {createServer} = require("http");
const {Server} = require("socket.io");
const path = require("path");
const app = express();
const server = createServer(app);
const io= new Server(server);
const __dirName = path.dirname(__filename);
let allusers = {};
app.use(express.static("public"));
app.get("/", (req,res)=>{
    console.log("got req");
    res.sendFile(path.join(__dirName + "/client/index.html"));
})
io.on("connection",(socket)=>{
    console.log("new connection", socket.id);
    socket.on("join-user", (username)=>{
        allusers[username]={username, id:socket.id};
        //inform all users that someone has joined
        io.emit("joined", allusers);
    })
    socket.on("offer", ({from, to, offer})=>{
        console.log({from, to, offer});
        io.to(allusers[to].id).emit("offer", {from,to,offer});
    })
    socket.on("answer", ({from, to, answer})=>{
        io.to(allusers[from].id).emit("answer", {from,to,answer});
    })
    socket.on("icecandidate", (candidate)=>{
        console.log(candidate);
        // broadcast to other peers means send to all except us.
        socket.broadcast.emit("icecandidate", candidate);
    })
    socket.on("end-call", ({from,to})=>{
        io.to(allusers[to].id).emit("end-call", {from,to});
    })
    socket.on("call-ended", (caller)=>{
        const [from,to] = caller;
        io.to(allusers[from].id).emit("call-ended", caller);
        io.to(allusers[to].id).emit("call-ended", caller);
    })
})
server.listen(9000,()=>{
    console.log("server is running on port 9000");
});

