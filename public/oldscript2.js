const socket = io();

let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      console.log("ontrack")
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
    };
}

// local
let createOffer = async () => {


    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    // return JSON.stringify(peerConnection.localDescription)
}

// remote
let createAnswer = async (offer) => {



    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer); 
    // return JSON.stringify(peerConnection.localDescription)
}

// local
let addAnswer = async (answer) => {

    console.log('answer:', answer)
    if (!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer);
    }
}

init()

async function pro(){
  console.log("t")
  const offer = await createOffer()
  socket.emit("offer", offer)
}

const offerButton = document.getElementById("offerButton")
var isAdmin = false
offerButton.addEventListener("click", () => {
  console.log("c")
  pro()
  isAdmin = true
})

socket.on("test", () => {
  console.log("test")
})

socket.on("taran", () => {
  socket.emit("taran")
})

socket.on("offer", async (offer) => {
  console.log("exec")
  if(!isAdmin){
    console.log("test")
    const answer = await createAnswer(offer)
    
    socket.emit("answer", answer)
  }
})


socket.on("answer", async (answer) => {
  console.log("answer")
  if(isAdmin) {
    await addAnswer(answer)
  }
})



// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)