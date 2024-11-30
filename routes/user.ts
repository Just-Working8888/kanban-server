// routes/user.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Редактирование пользователя (PATCH)
router.patch('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { userName, role, avatar } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                userName,
                role,
                avatar,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: 'Ошибка при обновлении пользователя' });
    }
});
router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Ошибка при получении информации о пользователе' });
    }
});
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);  // Логирование ошибки
        res.status(400).json({ message: 'Ошибка при получении информации о пользователях' });
    }
});
export default router;
