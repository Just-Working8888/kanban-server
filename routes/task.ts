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
import multer from "multer";
import path from "path";
import { errorMessage, successMessage } from "../common/returnMessage";
const router = require("express").Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Папка для сохранения изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Название файла с уникальной датой
  }
});

const upload = multer({ storage: storage });
// Обработка POST-запроса для создания задачи с изображением


// Обработка PATCH-запроса для изменения изображения задачи
router.patch("/:taskId/updateImage", upload.single("image"), async (req: Request, res: Response) => {
  const { taskId } = req.params;

  // Проверим, если файл был загружен
  if (!req.file) {
    return res.status(400).json({ message: "Файл не был загружен" });
  }

  try {
    const imageUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;

    // Обновим поле image в задаче
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        image: imageUrl, // Сохраняем путь к файлу
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении изображения задачи" });
  }
});

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
