// init app
import express, { json, urlencoded } from "express";
import RateLimit from "express-rate-limit";
import cors from "cors";
import Route from "./routes/api.js";

// create express app
const app = express();

// set up rate limiter: maximum of five requests per minute
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 10 requests per windowMs
});

// get em
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// init app
import express, { json, urlencoded } from "express";
import RateLimit from "express-rate-limit";
import cors from "cors";
import Route from "./routes/api.js";

// function getTimes() {
//   zones.forEach(async (element) => {
//     console.log(`running cache on ${element}`);
//     await getTimesAndWrite(element);
//   });
// }

// getTimes();

// enable middlewares
app.use(limiter);
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(express.static("public"));

// init route
app.use("/", Route);

// 404 handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    code: err.status || 500,
    status: "Not Found.",
    message: `Resource "${req.url}" is not found.`,
    error: err.message,
  });
});

export default app;
