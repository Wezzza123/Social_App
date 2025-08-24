"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    name = "Moaz";
    constructor() { }
    signup = (req, res) => {
        let { username, email, password } = req.body;
        console.log({ username, email, password });
        return res.status(201).json({ message: "done", data: req.body });
    };
    login = (req, res) => {
        return res.status(201).json({ message: "done", data: req.body });
    };
}
exports.default = new AuthenticationService();
