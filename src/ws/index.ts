import { Server } from "socket.io";
import { verify } from "jsonwebtoken";
import settings from "../settings";

export default (io: Server) => {
    let users = [];

    io.on("connection", socket => {

        socket.on("join", async token => {
          try {

            //decode the token:
            let user = await verify(token, settings.secret);

            //add the result to the list:
            users.push({ name: user["name"], id: socket.id });

            //send the result to the connected users:
            io.emit("changeusers", users);
            io.emit("userjoin", user["name"]);

            //send the id back:
            socket.emit("signedup", socket.id);
          } catch {
          //
          }
        });

        socket.on("leave", () => {
            let user = users.find(user => user.id === socket.id);
            if(!user) return;
            users = users.filter(user => user.id !== socket.id);
            io.emit("changeusers", users);
            io.emit("userleft", user.name);
        });

        socket.on("disconnect", () => {
            let user = users.find(user => user.id === socket.id);
            if(!user) return;
            users = users.filter(user => user.id !== socket.id);
            io.emit("changeusers", users);
            io.emit("userleft", user.name);
        });

        socket.on("sendmsg", async message => {
            let user = users.find(user => user.id === socket.id);
            io.emit("msgsent", { from: socket.id, message, date: new Date(), name:user.name });
        });
    });
}
