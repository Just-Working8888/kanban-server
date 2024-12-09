// src/types/express.d.ts

import { JwtPayload } from './auth';  // Импортируем тип, если он есть в другом файле
import { Request } from 'express';
import { Multer } from 'multer';

// Расширяем тип Request, добавляем свойство `user`
declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;  // Добавляем поле 'file' для запроса
            user?: JwtPayload; // Здесь `user` будет типом JwtPayload (или любым другим, который ты используешь)
        }
    }
}
