import { prisma } from "../prisma/prismaClient";
import { Request, Response } from "express";
import { errorMessage, successMessage } from "../common/returnMessage";
import * as yup from "yup";

const createBoardSchema = yup.object().shape({
  name: yup.string().required(),
});

const deleteBoardSchema = yup.object().shape({
  boardId: yup.string().required(),
});

export const getAllBoards = async (req: Request, res: Response) => {
  try {
    const result = await prisma.board.findMany();

    const response: successMessage = {
      message: "returned all boards",
      data: result,
    };

    res.status(200).send(response);
    return;
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong",
    };
    res.status(500).send(response);
  }
};

// TODO: classify the prisma errors
export const createBoard = async (req: Request, res: Response) => {
  try {
    const { name } = req.body.data;

    try {
      await createBoardSchema.validate({ name });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = await prisma.board.create({
      data: {
        name: name,
      },
    });

    const response: successMessage = {
      message: "returned all boards",
      data: result.id,
    };

    res.status(200).send(response);
    return;
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong",
    };
    res.status(500).send(response);
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.query["boardId"] as string;

    try {
      await deleteBoardSchema.validate({ boardId });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = await prisma.board.delete({
      where: {
        id: boardId,
      },
    });

    const response: successMessage = {
      message: "deleted board",
      data: result.id,
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong",
    };
    res.status(500).send(response);
  }
};

export const getOneBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.query["boardId"] as string;

    try {
      await deleteBoardSchema.validate({ boardId });
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
      select: {
        id: true,
        name: true,
        columns: true,
      },
    });

    const response: successMessage = {
      message: "one board data",
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
