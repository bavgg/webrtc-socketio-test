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

  socket.on("offer", (offer) => {
    console.log("offer");
    socket.broadcast.emit("offer", offer); // Broadcast to other peers
  });

  socket.on("answer", (answer) => {
    console.log("answer");
    socket.broadcast.emit("answer", answer); // Broadcast to other peers
  });

});

server.listen(3000, () => {
  console.log("Server started at port: ", 3000);
});
