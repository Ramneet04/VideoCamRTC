const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const socket = io();
let curruser="";
let localStream;
let caller=[];
const peerConnection = (function(){
    let peerConnection;
    const createPeerConnection = ()=>{
        const config = {
            iceservers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        };
        peerConnection = new RTCPeerConnection(config);

        //add localstream to peerConection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track,localStream);
        });
        //listen to remote stream and add to peer connection
        peerConnection.ontrack = (event) =>{
            remoteVideo.srcObject = event.streams[0];
        }
        //listen for ice candidate
        peerConnection.onicecandidate = (event) =>{
            if(event.candidate){
                socket.emit("icecandidate", event.candidate);
            }
        }
        return peerConnection;
    }
    return {
        getInstances: ()=>{
            if(!peerConnection){
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    }
})();
createUserBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    if(username.value!==""){
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        usernameContainer.style.display = "none";
        curruser=username.value;
    }

    username.value = "";
})
endCallBtn.addEventListener("click",(e)=>{
    socket.emit("call-ended", caller)
})

socket.on("joined",(allusers)=>{
    console.log(allusers);
    const createUsersHtml = () => {
        allusersHtml.innerHTML = "";

        for(const user in allusers) {
            const li = document.createElement("li");
            li.textContent = `${user} ${user === curruser ? "(You)" : ""}`;

            if(user !== curruser) {
                const button = document.createElement("button");
                button.classList.add("call-btn");
                button.addEventListener("click", (e) => {
                    startCall(user);
                });
                const img = document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);

                button.appendChild(img);

                li.appendChild(button);
            }

            allusersHtml.appendChild(li);
        }
    }

    createUsersHtml();
});

socket.on("offer", async ({from,to,offer})=>{
    const pc = peerConnection.getInstances();
    // set remote description
    await pc.setRemoteDescription(offer);
    // now remote machine will create an answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log("Offer received:", offer);
    console.log("Answer received:", answer);
    socket.emit("answer", {from, to, answer: pc.localDescription});
    caller= [from,to];
})

socket.on("answer",async ({from,to,answer})=>{
    const pc = peerConnection.getInstances();
    // set remote description
    await pc.setRemoteDescription(answer);
    endCallBtn.style.display = "block";
    socket.emit("end-call", {from,to});
    caller= [from,to];
})

socket.on("icecandidate", async (candidate)=>{
    console.log(candidate);
    const pc = peerConnection.getInstances();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
})

socket.on("end-call", ({from,to})=>{
    // no need of {from,to} as we are broadcasting or sending the event t that person only..
    endCallBtn.style.display = "block";
})

socket.on("call-ended", (caller)=>{
    endCall();
})
//start call method
const startCall = async (user)=>{
    console.log({user});
    const pc = peerConnection.getInstances();
    const offer = await pc.createOffer();
    console.log(offer);
    await pc.setLocalDescription(offer);
    socket.emit("offer", {from: curruser, to: user, offer: pc.localDescription});
}

const endCall = async ()=>{
    const pc = peerConnection.getInstances();
    if(pc){
        pc.close();
        endCallBtn.style.display="none";
    }
}
const startMyVideo = async ()=>{
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true});
        console.log(stream);
        localStream=stream;
        localVideo.srcObject = stream;
    } catch (error) {
        console.log(error);
    }
}
startMyVideo();