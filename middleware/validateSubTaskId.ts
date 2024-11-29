import { errorMessage } from "./../common/returnMessage";
import { prisma } from "./../prisma/prismaClient";
import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const schema = yup.object().shape({
  subTaskId: yup.string().required(),
});

export const validateSubTaskId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { subTaskId } = req.body.data;

  try {
    await schema.validate({ subTaskId });
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  const result = await prisma.subTask.findFirst({
    where: {
      id: subTaskId,
    },
  });

  if (!result) {
    const response: errorMessage = {
      message: "Invalid subtaskId",
    };
    res.status(404).send(response);
    return;
  }

  next();
};
