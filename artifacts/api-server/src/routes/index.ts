import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiConversationsRouter from "./gemini/conversations";
import sessionsRouter from "./sessions";
import elevenlabsRouter from "./elevenlabs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiConversationsRouter);
router.use(sessionsRouter);
router.use(elevenlabsRouter);

export default router;
