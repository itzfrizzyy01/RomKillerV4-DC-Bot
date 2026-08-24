import express, { type Express } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const dashboardPath = path.resolve(process.cwd(), "../romkillerv4-dashboard/dist/public");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use(express.static(dashboardPath));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api") && req.accepts("html")) {
    return res.sendFile(path.join(dashboardPath, "index.html"), (error) => {
      if (error) next(error);
    });
  }
  return next();
});

export default app;
