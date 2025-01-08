const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle ICE candidates
  socket.on("ice-candidate", (candidate) => {
    console.log("ICE candidate received");
    socket.broadcast.emit("ice-candidate", candidate);
  });

  // Handle offer
  socket.on("offer", (offer) => {
    console.log("Offer received");
    socket.broadcast.emit("offer", offer); // Broadcast the offer to other peers
  });

  // Handle answer
  socket.on("answer", (answer) => {
    console.log("Answer received");
    socket.broadcast.emit("answer", answer); // Broadcast the answer to other peers
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server started at port: 3000");
});
