import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Инициализация Prisma и Express
const prisma = new PrismaClient();
const router = express.Router();

// Настройки для загрузки файла с помощью multer
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Создаем папку, если её нет
        }
        cb(null, uploadPath); // Указываем путь
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}${fileExtension}`;
        cb(null, fileName); // Генерируем имя файла
    },
});

const upload = multer({ storage });

// Редактирование аватарки пользователя
router.patch('/:userId/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'Нет файла для загрузки' });
    }

    try {
        const imageUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                avatar: imageUrl, // Путь к файлу
            },
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: 'Ошибка при обновлении аватара пользователя' });
    }
});


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
// Получение информации о пользователе
router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                Board: true,
                tasks: {
                    include: {
                        assignedUsers: true,
                        columName: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
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

// Получение всех пользователей
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
