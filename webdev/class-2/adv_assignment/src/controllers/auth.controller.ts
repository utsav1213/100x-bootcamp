import type { Request, Response } from "express";
import { singnup, login } from "../services/auth.service";
import { SignupSchema, LoginSchema } from "../schemas/auth.schema";

export const signupController = async (req: Request, res: Response) => {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error)
    }
    const { email, password, name, role } = parsed.data;
    try {
        const token = await singnup(email, password, name, role);
        res.status(201).json({ token });
    }
    catch (error: any) {
        res.status(200).json({ error: error.message })
    }

        

};

export const loginController = async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const { email, password } = parsed.data;

  try {
    const token = await login(email, password);
    res.json({ token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
