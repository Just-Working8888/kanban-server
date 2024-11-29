import { errorMessage } from "./../common/returnMessage";
import { prisma } from "./../prisma/prismaClient";
import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const schema = yup.object().shape({
  boardId: yup.string().required(),
});

export const validateBoardId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const boardId = req.query["boardId"] as string;

  try {
    await schema.validate({ boardId: boardId });
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  const result = await prisma.board.findFirst({
    where: {
      id: boardId,
    },
  });

  if (!result) {
    const response: errorMessage = {
      message: "boardId is not in the database",
    };
    res.status(404).send(response);
    return;
  }

  next();
};
