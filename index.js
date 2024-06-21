import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/index.js";
import cookie from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { PORT } from "./src/utils/variable.js";

dotenv.config();
const app = express();

const corsOptions = {
  origin: "https://funquized-fe.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(cookie());
app.use(express.static("public"));
app.use(fileUpload());
app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});
