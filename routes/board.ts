import { validateBoardId } from "./../middleware/validateBoardId";
import {
  createBoard,
  getAllBoards,
  deleteBoard,
  getOneBoard,
  addUserToBoard,
  removeUserFromBoard,
} from "../controllers/boardController";
import authMiddleware from "../middleware/auth";
import { Request, Response } from "express";

const router = require("express").Router();

router.get("/", authMiddleware, getAllBoards);
router.get('/isauth', authMiddleware, async (req: Request, res: Response) => {

  try {
    res.json({ isAuth: true });

  } catch (error) {
    res.status(401)
    res.json({ isAuth: false });
  }
})

router.get("/getOneBoard", getOneBoard);

router.post("/", createBoard);

router.delete("/", validateBoardId, deleteBoard);
router.post("/addUserToBoard", addUserToBoard); // Новый маршрут
router.post("/removeUserFromBoard", removeUserFromBoard); // Новый маршрут

module.exports = router;
