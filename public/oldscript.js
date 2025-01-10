const socket = io();

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  remoteStream = new MediaStream();
  document.getElementById("user-1").srcObject = localStream;
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

let createOffer = async () => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      const offerSDP = peerConnection.localDescription;
      socket.emit("offer", offerSDP);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

let createAnswer = async (offer) => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("Adding answer candidate...:", event.candidate);
      const answerSDP = peerConnection.localDescription;
      socket.emit("answer", answerSDP);
    }
  };

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log("test");
};

let addAnswer = async (answer) => {
  console.log("answer:", answer);
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

const offerButton = document.getElementById("offerButton");
var isAdmin = false;
offerButton.addEventListener("click", () => {
  createOffer();
  isAdmin = true;
});

socket.on("offer", async (offer) => {
  console.log("exec");
  if (!isAdmin) {
    console.log("test");
    createAnswer(offer);
  }
});

socket.on("answer", async (answer) => {
  console.log("answer");
  if (isAdmin) {
    await addAnswer(answer);
  }
});
