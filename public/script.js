const socket = io();

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

// Initialize streams
let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  remoteStream = new MediaStream();

  document.getElementById("user-1").srcObject = localStream;
  document.getElementById("user-2").srcObject = remoteStream;

  // Add local tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };
};

// Create and send an offer
let createOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", peerConnection.localDescription);
};

// Handle incoming offer and create an answer
let createAnswer = async (offer) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", peerConnection.localDescription);
};

// Add the received answer to the peer connection
let addAnswer = async (answer) => {
  if (!peerConnection.currentRemoteDescription) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
};

init();

const offerButton = document.getElementById("offerButton");
let isAdmin = false;

// Handle offer button click
offerButton.addEventListener("click", async () => {
  isAdmin = true;
  await createOffer();
});

// Socket event handlers
socket.on("offer", async (offer) => {
  if (!isAdmin) {
    await createAnswer(offer);
  }
});

socket.on("answer", async (answer) => {
  if (isAdmin) {
    await addAnswer(answer);
  }
});

socket.on("ice-candidate", async (candidate) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
});
