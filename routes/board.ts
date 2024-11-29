import { validateBoardId } from "./../middleware/validateBoardId";
import {
  createBoard,
  getAllBoards,
  deleteBoard,
  getOneBoard,
} from "../controllers/boardController";

const router = require("express").Router();

router.get("/", getAllBoards);

router.get("/getOneBoard", getOneBoard);

router.post("/", createBoard);

router.delete("/", validateBoardId, deleteBoard);

module.exports = router;
