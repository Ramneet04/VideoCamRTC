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
})
server.listen(9000,()=>{
    console.log("server is running on port 9000");
});

