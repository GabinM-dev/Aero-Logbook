import { Router, type IRouter } from "express";
import healthRouter from "./health";
import flightsRouter from "./flights";
import profileRouter from "./profile";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightsRouter);
router.use(profileRouter);
router.use(statsRouter);

export default router;
