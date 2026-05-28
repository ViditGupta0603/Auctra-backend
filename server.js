require("dotenv").config();

const http = require("http");

const app = require("./src/app");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://github.com/ViditGupta0603/auctra-frontend",
    methods: ["GET", "POST", "PATCH"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});