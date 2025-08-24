import type { Request, Response } from "express";
import { ISignupBodyInputDTto } from "./auth.dto";


class AuthenticationService {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: ISignupBodyInputDTto = req.body;

    console.log({ username, email, password });

 
    return res.status(201).json({
      message: "done",
      data: req.body
    });
  };

  login = (req: Request, res: Response): Response => {
    return res.status(201).json({ message: "done", data: req.body });
  };
}

export default new AuthenticationService();
