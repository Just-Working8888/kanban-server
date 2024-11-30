import { Request, Response } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  updateTask,
  updateTaskColor,
} from "./../controllers/taskController";
import { validateColumnId } from "./../middleware/validateColumnId";
import { validateTaskId } from "./../middleware/validateTaskId";
import { prisma } from "../prisma/prismaClient";
const router = require("express").Router();


// Назначение пользователей на задачу
router.post('/:taskId/assign', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { userIds } = req.body; // Массив userIds

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          connect: userIds.map((userId: string) => ({ id: userId })),
        },
      },
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при назначении пользователей на задачу' });
  }
});

// Удаление назначения пользователя с задачи
router.post('/:taskId/unassign', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          disconnect: { id: userId },
        },
      },
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении пользователя с задачи' });
  }
});

router.get("/", validateTaskId, getTask);

// pass columnId in request body
router.post("/", validateColumnId, createTask);

// add taskId as query parameter and columnId to request body
router.delete("/", validateTaskId, validateColumnId, deleteTask);

router.put("/updateTask", validateTaskId, updateTask);

router.put('updateTaskColor', validateTaskId, updateTaskColor)
// TODO: made updateTask functionality

module.exports = router;
