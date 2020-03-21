import { Router } from "express";
import validate from "../validator";
import respond from "../classes/respond";
import User from "../models/User";
import { hashSync, compareSync, compare } from "bcrypt";
import generateToken from "../helpers/generateToken";
import auth from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        let { name, username, password } = req.body;

        //validate name:
        if (!validate.name(name)) return res.status(400).json(respond({
            data: null,
            message: "name is not valid",
            type: "error"
        })).end();

        //validate username:
        if (!validate.username(username)) return res.status(400).json(respond({
            data: null,
            message: "username is not valid",
            type: "error"
        })).end();

        //validate password:
        if (!validate.password(password)) return res.status(400).json(respond({
            data: null,
            message: "password is not valid",
            type: "error"
        })).end();

        //check if username is not used before:
        let user = await User.exists({ username });
        if (user) return res.status(400).json(respond({
            data: null,
            message: "username is used before",
            type: "error"
        })).end();

        //hash the password:
        let hash = hashSync(password, 10);

        let newUser = await User.create({
            name, username, password: hash
        });

        let token = await generateToken(username, name);

        res.status(201).json(respond({
            data: {
                name: newUser["name"],
                username: newUser["username"],
                token
            },
            message: "user was registered successfully",
            type: "success"
        })).end();
    }
    catch (err) {
        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }
});

router.post("/login", async (req, res) => {
    try {
        let { username, password } = req.body;

        //validate username:
        if (!validate.username(username)) return res.status(400).json(respond({
            data: null,
            message: "username is not valid",
            type: "error"
        })).end();

        //validate password:
        if (!validate.password(password)) return res.status(400).json(respond({
            data: null,
            message: "password is not valid",
            type: "error"
        })).end();

        //find thr user:
        let user = await User.findOne({ username });
        if (!user) return res.status(401).json(respond({
            data: null,
            message: "username or password is not correct",
            type: "error"
        })).end();

        //compare the password:
        let checkPassword = compareSync(password, user["password"]);
        if (!checkPassword) return res.status(401).json(respond({
            data: null,
            message: "username or password is not correct",
            type: "error"
        })).end();

        let token = await generateToken(username, user["name"]);

        res.status(201).json(respond({
            data: {
                name: user["name"],
                username: user["username"],
                token
            },
            message: "logged in successfully",
            type: "success"
        })).end();
    }
    catch (err) {


        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }
});

router.patch("/", auth(), async (req, res) => {
    try {
        let userId = req["user"];
        let { name, username, password, oldPassword } = req.body;

        //validate name:
        if (name && !validate.name(name)) return res.status(400).json(respond({
            data: null,
            message: "name is not valid",
            type: "error"
        })).end();

        //validate username:
        if (username && !validate.username(username)) return res.status(400).json(respond({
            data: null,
            message: "username is not valid",
            type: "error"
        })).end();


        //check if the value is undefined and delete it:
        let userInfo = { name, username, password };
        if (!name) delete userInfo.name;
        if (!username) delete userInfo.username;

        let user = await User.findById(userId);

        // compare the oldPassword:
        let testOldPassword = await compare(oldPassword, user["password"]);
        if (!testOldPassword) return res.status(400).json(respond({
            data: null,
            message: "password is wrong",
            type: "error"
        })).end();



        for (const field in userInfo) {
            if (userInfo.hasOwnProperty(field)) {
                const pieceOfInfo = userInfo[field];
                user[field] = pieceOfInfo;
            }
        }
        await user.save();

        return res.status(202).json(respond({
            data: {
                ...userInfo
            },
            message: "info updated successfully",
            type: "success"
        })).end();

    } catch (err) {
        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }

});

router.delete("/", auth(), async (req, res) => {
    try {
        let userId = req["user"];
        await User.deleteOne({ _id: userId });
        return res.status(202).end();
    } catch (err) {

        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }

});

router.get("/me", auth(), async (req, res) => {
    try {
        let userId = req["user"];

        let user = await User.findById(userId);

        return res.status(200).json(respond({
            type: "success",
            data: { username: user["username"], name: ["name"] },
            message: ""
        })).end();
    } catch (err) {
        res.status(500).json(respond({
            data: null,
            message: "internal server error",
            type: "error"
        })).end();
    }
});

export default router;
