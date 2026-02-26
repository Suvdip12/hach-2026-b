import { Router } from "express";

import { verifyDomain } from "../controllers/domain.controller";

const domainRouter = Router();

domainRouter.get("/verify", verifyDomain);

export default domainRouter;
