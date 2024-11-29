import { prisma } from "../prisma/prismaClient";
import { Request, Response } from "express";
import { errorMessage, successMessage } from "../common/returnMessage";
import * as yup from "yup";

const updateColumnNamesSchema = yup.object().shape({
  id: yup.string().optional(),
  name: yup.string().required(),
});

const updateBoardSchema = yup.object().shape({
  name: yup.string().required(),
  colNames: yup.array().of(updateColumnNamesSchema).required(),
  boardId: yup.string().required(),
});

// TODO: when the body.data is undefined it should give the 400 error
export const updateBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.query["boardId"] as string;
    const { name, colNames } = req.body.data;

    try {
      await updateBoardSchema.validate({ name, colNames, boardId });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = prisma.$transaction(async () => {
      const boardData = await prisma.board.findFirst({
        where: {
          id: boardId,
        },
        select: {
          name: true,
          columns: true,
        },
      });

      // if the board name is different from the name update the boardName
      if (boardData?.name !== name) {
        await prisma.board.update({
          where: {
            id: boardId,
          },
          data: {
            name: name,
          },
        });
      }

      // find out the new columns that we need to add
      const newColumns = colNames.filter(
        (column: any) => column.id === undefined
      );

      // if the column names are different than the current names
      const databaseColumns = boardData?.columns;

      const idToNameMap = colNames.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.name;
        return acc;
      }, {});

      const updateColumns = databaseColumns
        ?.filter((col: any) => {
          return idToNameMap[col.id] && idToNameMap[col.name] !== col.name;
        })
        .map((col: any) => {
          return {
            ...col,
            name: idToNameMap[col.name],
          };
        });

      // find the columns that need to be deleted;
      const deleteColumns = databaseColumns?.filter((column: any) => {
        return column.id in idToNameMap === false;
      });

      // add new columns into the database
      for (let i = 0; i < newColumns.length; ++i) {
        try {
          await prisma.columns.create({
            data: {
              name: newColumns[i].name,
              boardId: boardId,
            },
          });
        } catch (error) {
          const response: errorMessage = {
            message: "Something went wrong",
          };
          res.status(500).send(response);
        }
      }

      // update the existing columns names
      if (updateColumns)
        for (let i = 0; i < updateColumns?.length; ++i) {
          try {
            await prisma.columns.update({
              where: {
                id: updateColumns[i].id,
              },
              data: {
                name: updateColumns[i].name,
              },
            });
          } catch (error) {
            const response: errorMessage = {
              message: "Something went wrong",
            };
            res.status(500).send(response);
          }
        }

      // delete the columns
      if (deleteColumns)
        for (let i = 0; i < deleteColumns?.length; ++i) {
          try {
            await prisma.columns.delete({
              where: {
                id: deleteColumns[i].id,
              },
            });
          } catch (error) {
            const response: errorMessage = {
              message: "Something went wrong",
            };
            res.status(500).send(response);
          }
        }
    });

    const response: successMessage = {
      message: "Updated successfully",
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

export const getBoardNameAndColumns = async (req: Request, res: Response) => {
  try {
    const boardId = req.query["boardId"] as string;

    const boardName = await prisma.board.findFirst({
      where: {
        id: boardId,
      },
    });

    const boardColumns = await prisma.columns.findMany({
      where: {
        boardId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const response: successMessage = {
      message: "Board and column names",
      data: {
        boardName: boardName?.name,
        columns: boardColumns,
      },
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong",
    };
    res.status(500).send(response);
  }
};
