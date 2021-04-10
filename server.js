const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set-up static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatBot";

//Run when client connect
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome user
        socket.emit("message", formatMessage(botName, " Welcome to ChatBot! "));

        //Broadcast when a user connect
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, ` ${user.username} has joined the chat`)
            );
        //Send users room information
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    //Listen to message
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    //Run when user disconnect
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, ` ${user.username} has left the chat`)
            );

            //Send users room information
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
    console.log(`Application running on http://localhost:${PORT}`)
);