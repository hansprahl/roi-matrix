import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateReportRouter from "./generate-report";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateReportRouter);

export default router;
