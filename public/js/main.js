const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const socket = io();
let curruser="";
let localStream;
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
        localStream.getTracks().array.forEach(track => {
            peerConnection.addTrack(track,localStream);
        });
        //listento remote stream and add to peer connection
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

//start call method
const startCall = (user)=>{
    console.log({user});
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