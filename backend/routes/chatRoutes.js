import { Router } from "express";
import { chatWithAI } from "../controllers/chatController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = Router();

router.post("/", authenticateUser, chatWithAI);

export default router;