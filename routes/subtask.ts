import { updateSubTaskStatus } from "./../controllers/taskController";
import { deleteSubTask } from "../controllers/subTaskController";
import { validateSubTaskId } from "./../middleware/validateSubTaskId";
const router = require("express").Router();

router.delete("/", validateSubTaskId, deleteSubTask);

router.put("/updateSubtaskStatus", validateSubTaskId, updateSubTaskStatus);
module.exports = router;
