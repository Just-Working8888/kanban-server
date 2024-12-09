import express from "express";
import authRouter from './routes/auth'
import userRouter  from './routes/user'
import path from "path";

const bodyParser = require("body-parser");
const cors = require("cors");
const allowedOrigins = ["http://localhost:7100"];

//sss

const app = express();
const port = 3000;
// TODO: - add localhost:3000 the only allowed origins
app.use(cors(allowedOrigins));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/auth', authRouter); // Маршруты для регистрации и логина
app.use("/api/v1/board", require("./routes/board"));
app.use("/api/v1/column", require("./routes/column"));
app.use("/api/v1/boardAndColumnUpdate", require("./routes/boardAndColumn"));
app.use("/api/v1/task", require("./routes/task"));
app.use("/api/v1/subTask", require("./routes/subtask"));
app.use('/api/v1/user', userRouter);  // Роуты для работы с пользователями

app.listen(port, () => console.log("Server listening on port " + port));
