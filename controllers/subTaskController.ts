import { prisma } from "../prisma/prismaClient";
import { Request, Response } from "express";
import { errorMessage, successMessage } from "../common/returnMessage";

const decrementEachPosition = async (taskId: string) => {
  const tasks = await prisma.subTask.findMany({
    where: { taskId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    await prisma.subTask.update({
      where: {
        id: task.id,
      },
      data: {
        position: i + 1,
      },
    });
  }
};

export const deleteSubTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;

    const result = await prisma.subTask.delete({
      where: { id: taskId },
    });

    await decrementEachPosition(taskId);

    const response: successMessage = {
      message: "Task deleted successfully",
      data: result,
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong",
    };
    res.status(500).send(response);
  }
};
