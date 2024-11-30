// src/routes/auth.ts
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { User } from '../types/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req: Request, res: Response) => {
    const { email, userName, password }: User = req.body;

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return res.status(400).json({ message: 'Email уже зарегистрирован' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const user = await prisma.user.create({
        data: {
            email,
            userName,
            password: hashedPassword,
        },
    });

    // Создаем JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
    });

    res.status(201).json({ token, userId: user.id });
});

// Логин пользователя
router.post('/login', async (req: Request, res: Response) => {
    const { email, password }: { email: string; password: string } = req.body;

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Создаем JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
    });

    res.json({ token, userId: user.id });
});

export default router;
