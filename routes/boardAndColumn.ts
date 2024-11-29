import { validateMultipleColumnsIds } from "./../middleware/validateColumnId";
import {
  getBoardNameAndColumns,
  updateBoard,
} from "./../controllers/boardAndColumnController";
import { validateBoardId } from "./../middleware/validateBoardId";
const router = require("express").Router();

// pass boardId and optional name and array of names of columns;
router.put("/", validateBoardId, validateMultipleColumnsIds, updateBoard);

router.get("/boardNameAndColumns", validateBoardId, getBoardNameAndColumns);

module.exports = router;
