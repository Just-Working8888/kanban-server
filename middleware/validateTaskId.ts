import { errorMessage } from "./../common/returnMessage";
import { prisma } from "./../prisma/prismaClient";
import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const schema = yup.object().shape({
  taskId: yup.string().required(),
  position: yup.number().optional(),
});

export const validateTaskId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const taskId = req.query["taskId"] as string;

  try {
    await schema.validate({ taskId: taskId });
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  const result = await prisma.task.findFirst({
    where: {
      id: taskId,
    },
  });

  if (!result) {
    const response: errorMessage = {
      message: "Invalid taskId",
    };
    res.status(404).send(response);
    return;
  }

  next();
};

export const validateMultipleTaskIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = req.body;

  try {
    for (let i = 0; i < data.length; ++i) {
      await schema.validate({
        taskId: data[i].taskId,
        position: data[i].position,
      });
    }
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  for (let i = 0; i < data.length; ++i) {
    try {
      await prisma.task.findFirst({
        where: {
          id: data[i].taskId,
        },
      });
    } catch (error) {
      const response: errorMessage = {
        message: "Something went wrong",
      };
      res.status(500).send(response);
      return;
    }
  }

  next();
};
