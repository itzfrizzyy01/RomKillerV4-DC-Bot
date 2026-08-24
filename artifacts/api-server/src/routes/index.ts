import { Router, type IRouter } from "express";
import healthRouter from "./health";
import romkillerRouter from "./romkiller";

const router: IRouter = Router();

router.use(healthRouter);
router.use(romkillerRouter);

export default router;
