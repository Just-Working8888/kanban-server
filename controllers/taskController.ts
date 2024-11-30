import { prisma } from "../prisma/prismaClient";
import { Request, Response } from "express";
import { errorMessage, successMessage } from "../common/returnMessage";
import * as yup from "yup";

const decrementEachPosition = async (columnId: string) => {
  const tasks = await prisma.task.findMany({
    where: { columnId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        position: i + 1,
      },
    });
  }
};

const decrementEachSubTaskPosition = async (taskId: string) => {
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
        position: i - 1,
      },
    });
  }
};

const subTaskSchema = yup.object().shape({
  id: yup.string().optional(),
  title: yup.string().required(),
});

const createTaskSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  subTasks: yup.array().of(subTaskSchema).required(),
  columnId: yup.string().required(),
});

export const getTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.query["taskId"] as string;

    const result = await prisma.task.findFirst({
      where: {
        id: taskId,
      },
      orderBy: { position: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        columnId: true,
        columName: true,
        position: true,
        priority: true,
        dueDate: true,
        color: true,
        subTask: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            taskId: true,
            status: true,
            position: true,
          },
        },
      },
    });

    const response: successMessage = {
      message: "returned specified task",
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

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, subTasks, columnId, priority, dueDate, color } = req.body.data;

    try {
      await createTaskSchema.validate({
        title: title,
        priority: priority,
        dueDate: dueDate,
        description: description,
        subTasks: subTasks,
        columnId: columnId,
        color: color
      });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = await prisma.$transaction(async () => {
      // count the total number
      const totalRecords = await prisma.task.count({
        where: {
          columnId: columnId,
        },
      });

      const result = await prisma.task.create({
        data: {
          title: title,
          description: description,
          priority: priority,
          dueDate: dueDate,
          position: totalRecords + 1,
          columnId: columnId,
          color: color,
        },
      });

      for (const subTask of subTasks) {
        // find the total number of subtask for given taskId
        const totalRecords = await prisma.subTask.count({
          where: {
            taskId: result.id,
          },
        });

        // add into the database new subtask
        await prisma.subTask.create({
          data: {
            title: subTask.title,
            position: totalRecords + 1,
            taskId: result.id,
          },
        });
      }
    });

    const response: successMessage = {
      message: "All the columns name",
      data: [],
    };

    res.status(200).send(response);
  } catch (error) {
    const response: errorMessage = {
      message: "Something went wrong" + error,
    };
    console.log(error);

    res.status(500).send(response);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.query["taskId"] as string;
    const { columnId } = req.body.data;

    const result = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    await decrementEachPosition(columnId);
    const response: successMessage = {
      message: "returned specified task",
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

export const updateTaskColor = async (req: Request, res: Response) => {
  try {
    const taskId = req.query["taskId"] as string;

    const { color } = req.body.data;

    try {
      await createTaskSchema.validate({
        color
      });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = prisma.$transaction(async () => {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: { subTask: true },
      });

      // if the title of the task is changed, update the title
      if (color !== task?.color)
        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            color: color,
          },
        });
    });

    const response: successMessage = {
      message: "Updated successfully",
      data: result,
    };
    res.status(200).send(response);
  } catch (error) { }
};

export const updateSubTaskStatus = async (req: Request, res: Response) => {
  try {
    const { status, subTaskId } = req.body.data;

    const result = await prisma.subTask.update({
      where: {
        id: subTaskId,
      },
      data: {
        status: status,
      },
    });

    const response: successMessage = {
      message: "returned specified task",
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

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.query["taskId"] as string;

    const { title, description, subTasks, columnId, dueDate, priority } = req.body.data;

    try {
      await createTaskSchema.validate({
        title,
        description,
        dueDate,
        priority,
        subTasks,
        columnId,
      });
    } catch (error: any) {
      const response: errorMessage = {
        message: error.message,
      };
      res.status(400).send(response);
      return;
    }

    const result = prisma.$transaction(async () => {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: { subTask: true },
      });

      // if the title of the task is changed, update the title
      if (title !== task?.title)
        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            title: title,
          },
        });

      // if the description of the task is changed, update the description
      if (description !== task?.description)
        await prisma.task.update({
          where: { id: taskId },
          data: { description: description },
        });

      // if the task has been moved to a different column, update the columnId
      if (columnId !== task?.columnId)
        await prisma.task.update({
          where: { id: taskId },
          data: { columnId: columnId },
        });

      if (dueDate !== task?.dueDate)
        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            dueDate: dueDate,
          },
        });
      if (priority !== task?.priority)
        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            priority: priority,
          },
        });
      // make a map to so the faster searching;
      const databaseSubTasks = subTasks;

      const idToNameMap = databaseSubTasks.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.title;
        return acc;
      }, {});

      // find the subTasks that are not present in the current data, we need to delete that tasks from the database

      const deleteSubTasks = task?.subTask.filter((task: any) => {
        return task.id in idToNameMap === false;
      });

      if (deleteSubTasks && deleteSubTasks.length > 0)
        for (let i = 0; i < deleteSubTasks.length; ++i) {
          try {
            await prisma.subTask.delete({
              where: {
                id: deleteSubTasks[i].id,
              },
            });
            if (task) await decrementEachSubTaskPosition(task?.id);
          } catch (error: any) {
            const response: errorMessage = {
              message: "Something went wrong",
            };
            res.status(500).send(response);
            return;
          }
        }

      // find the subTasks that are present in the database and which need to have an update
      const updateSubTasks = task?.subTask
        ?.filter((task: any) => {
          return task.id in idToNameMap && idToNameMap[task.id] !== task.title;
        })
        .map((task: any) => {
          return {
            ...task,
            title: idToNameMap[task.id],
          };
        });

      if (updateSubTasks && updateSubTasks.length > 0)
        for (let i = 0; i < updateSubTasks.length; ++i) {
          try {
            await prisma.subTask.update({
              where: {
                id: updateSubTasks[i].id,
              },
              data: {
                title: updateSubTasks[i].title,
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

      // find the subtasks that are not present in the database and add them to the database;
      const newSubTasks = subTasks.filter((task: any) => task.id === undefined);

      if (newSubTasks && newSubTasks.length > 0 && task) {
        let errorOccurred = false;
        const totalRecords = await prisma.subTask.count({
          where: {
            taskId: task.id,
          },
        });

        for (let i = 0; i < newSubTasks.length; ++i) {
          try {
            await prisma.subTask.create({
              data: {
                title: newSubTasks[i].title,
                position: totalRecords + 1,
                taskId: task.id,
              },
            });
          } catch (error: any) {
            errorOccurred = true;
          }
        }
      }
    });

    const response: successMessage = {
      message: "Updated successfully",
      data: result,
    };

    res.status(200).send(response);
  } catch (error) { }
};
