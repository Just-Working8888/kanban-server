import { prisma } from "../prisma/prismaClient";
import { Request, Response } from "express";
import { errorMessage, successMessage } from "../common/returnMessage";
import * as yup from "yup";
import { JwtPayload } from "../types/auth";
interface IGetUserAuthInfoRequest extends Request {
  user: any // or any other type
}
const createBoardSchema = yup.object().shape({
  name: yup.string().required(),
});

const deleteBoardSchema = yup.object().shape({
  boardId: yup.string().required(),
});
export const removeUserFromBoard = async (req: Request, res: Response) => {
  const { boardId, userId } = req.body;

  if (!boardId || !userId) {
    return res.status(400).json({ error: "Board ID and User ID are required" });
  }

  try {
    // Проверим, существует ли доска
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Проверим, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Проверяем, что пользователь действительно связан с доской
    const boardUser = await prisma.boardUser.findUnique({
      where: {
        boardId_userId: {
          boardId: boardId,
          userId: userId,
        },
      },
    });

    if (!boardUser) {
      return res.status(404).json({ error: "User is not part of this board" });
    }

    // Удаляем пользователя с доски
    await prisma.boardUser.delete({
      where: {
        boardId_userId: {
          boardId: boardId,
          userId: userId,
        },
      },
    });

    return res.status(200).json({ message: "User removed from board successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove user from board" });
  }
};
export const addUserToBoard = async (req: Request, res: Response) => {
  const { boardId, userId } = req.body;

  if (!boardId || !userId) {
    return res.status(400).json({ error: "Board ID and User ID are required" });
  }

  try {
    // Проверим, существует ли доска
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Проверим, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Добавляем пользователя на доску с ролью MEMBER
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: {
        BoardUser: {
          create: { // Добавляем нового пользователя с ролью "MEMBER"
            userId: userId,
            role: "MEMBER", // Можно указать роль участника
          },
        },
      },
    });

    return res.status(200).json(updatedBoard);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add user to board" });
  }
};

export const getAllBoards = async (req: any, res: Response) => {

  const user: any = req.user

  try {
    // Получаем все доски, к которым этот пользователь имеет доступ
    const boards = await prisma.board.findMany({
      where: {
        BoardUser: {
          some: {
            userId: user.userId, // Проверяем, что пользователь связан с доской
          },
        },
      },
      select: {
        id: true,
        name: true,
        columns: true,
      },
    });

    if (boards.length === 0) {
      return res.status(404).json({ message: 'No boards found for the user' });
    }

    const response: successMessage = {
      message: 'Returned boards that the user has access to',
      data: boards,
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: 'Something went wrong while fetching boards',
    };
    res.status(500).send(response);
  }
};

// TODO: classify the prisma errors
export const createBoard = async (req: Request, res: Response) => {
  try {
    const { name, userId } = req.body.data;

    if (!name || !userId) {
      return res.status(400).json({ error: "Name and User ID are required" });
    } 
    

    // Валидируем данные с помощью yup
    try {
      await createBoardSchema.validate({ name, userId });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    // Создаем доску
    const result = await prisma.board.create({
      data: {
        name: name,
        user: { // Добавляем связь с пользователем
          connect: { id: userId }, // Связываем с пользователем через ID
        },
        BoardUser: {
          create: {
            userId: userId,  // Связываем пользователя с доской
            role: "CREATOR", // Устанавливаем роль создателя
          },
        },
      },
    });

    const response: successMessage = {
      message: "Board created successfully",
      data: result.id,  // Возвращаем ID новой доски
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong: " + error,
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
        BoardUser: {
          select: {
            user: true,
          }
        }
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
