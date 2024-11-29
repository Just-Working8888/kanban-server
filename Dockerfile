# Используем базовый образ Node.js
FROM node:18

# Создаём рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Устанавливаем Prisma CLI для миграций
RUN npm install -g prisma

# Открываем порт для Express сервера
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run","devStart"]
