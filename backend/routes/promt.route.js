import express from "express";
import { sendPromt, getPromt, deletePromt, createdPromt } from "../controller/promt.controller.js";
import userMiddleware from "../middleware/promt.middlware.js";

const router = express.Router();

router.post("/promt", userMiddleware, sendPromt);
router.post("/getpromt", userMiddleware, getPromt);
router.post("/deletepromt", userMiddleware, deletePromt);
router.post("/createdpromt", userMiddleware, createdPromt);

export default router;
