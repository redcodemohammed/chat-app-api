import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import settings from "../settings";
import User from "../models/User";
import respond from "../classes/respond";


export default () => async (req: Request, res: Response, next: NextFunction) => {
    let tokenHeader = req.headers.authorization;
    try {
        let token = clearToken(tokenHeader);

        //@ts-ignore
        let verifying: { username: string, name: string } = await verify(token, settings.secret);

        let user = await User.findOne({ username: verifying.username });

        if (!user) return res.status(402).json(respond({
            data: null,
            message: "the session has over",
            type: "error"
        })).end();

        else {
            req["user"] = user._id;
            next();
        };

    } catch (err) {
        if (err == "Error: invalid jwt") return res.status(402).json(respond({
            data: null,
            message: "the session has over",
            type: "error"
        })).end();

        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }
}

function clearToken(token: string): string {
    if (typeof token !== "string") throw new Error("invalid jwt");
    if (/\s/g.test(token)) {
        return token.split(' ')[1];
    } else {
        return token;
    }
};
