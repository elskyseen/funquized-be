import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/index.js";
import cookie from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors({ credentials: true }));
app.use(cookie());
app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});
