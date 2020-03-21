import express from "express";
import http from "http";
import socketio from "socket.io";
import helmet from "helmet";
import bodyparser from "body-parser";
import morgan from "morgan";
import mongoose, { ConnectionOptions } from 'mongoose';
import cors from "cors";
import appSettings from "./settings";

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

import ws from "./ws";
ws(io);

const dev = true;
const PORT = process.env.PORT || appSettings.defaultPort;
const mongoDBUrl = dev ? "mongodb://chatapp:a123456@ds113738.mlab.com:13738/chat-app" : (process.env.mongoDBUrl || ""); //TODO: Add a real database. :)
// const mongoDBUrl = dev ? "mongodb://localhost/chat-app" : (process.env.mongoDBUrl || ""); //TODO: Add a real database. :)

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(morgan("dev"))
app.use(helmet({
    xssFilter: true,
    noCache: true,
    hidePoweredBy: true
}));
app.use(cors());

let settings: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};

try {
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDBUrl, settings);
    mongoose.connection.on("open", () => console.log("connected to db"));
    mongoose.connection.once("error", err => console.log("mongo err " + err));
} catch (err) {
    console.log("Error");
}

//import routes & middlewares:
import respond from "./classes/respond";
import userRoute from "./routes/user";

app.use("/api/user", userRoute);

app.use((req, res) => {
    res.status(404).json(respond({
        data: null,
        message: "page not fount",
        type: "error"
    }));
})

server.listen(PORT, () => console.log(`api is working on port ${PORT}`));
