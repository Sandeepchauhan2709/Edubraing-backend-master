import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";

app.get("/", (req, res) => {
  res.send("Welcome to EduBrain Backend.. Server is running..");
});

//handling uncaught
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception`);
  process.exit(1);
});

//config
config({
  path: "./config/config.env",
});

connectDB();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is working on PORT: ${process.env.PORT}`);
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting Down the server due to unhandled promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
