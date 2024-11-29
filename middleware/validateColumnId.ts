import { errorMessage } from "./../common/returnMessage";
import { prisma } from "./../prisma/prismaClient";
import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const columnIdSchema = yup.object().shape({
  columnId: yup.string().required(),
});

const multipleColumnIdSchema = yup.object().shape({
  id: yup.string().optional(),
  name: yup.string().required(),
});

const validateMultipleColumnIdsSchema = yup.object().shape({
  colNames: yup.array().of(multipleColumnIdSchema).required(),
});

export const validateColumnId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { columnId } = req.body.data;

  try {
    await columnIdSchema.validate({ columnId });
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  const result = await prisma.columns.findFirst({
    where: {
      id: columnId,
    },
  });

  if (!result) {
    const response: errorMessage = {
      message: "columnId is not in the database",
    };
    res.status(404).send(response);
    return;
  }

  next();
};

export const validateMultipleColumnsIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { colNames } = req.body.data;

  try {
    await validateMultipleColumnIdsSchema.validate({ colNames });
  } catch (error: any) {
    const response: errorMessage = {
      message: error.message,
    };
    res.status(400).send(response);
    return;
  }

  for (let i = 0; i < colNames.length; ++i) {
    try {
      if (colNames[i].id && colNames[i].id !== "") {
        const result = await prisma.columns.findFirstOrThrow({
          where: {
            id: colNames[i].id,
          },
        });
      }
    } catch (error) {
      const response: errorMessage = {
        message: "Invalid column ID. Please contact support for assistance.",
      };
      res.status(500).send(response);
    }
  }

  next();
};
