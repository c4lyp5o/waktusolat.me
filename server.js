import express from "express";
import dotenv from "dotenv";
import { graphqlHTTP } from "express-graphql";
import RateLimit from "express-rate-limit";
import cors from "cors";
import { createServer } from "node:http";
import path from "node:path";
import logger from "./utils/logger.js";

dotenv.config();

import websocket from "./controllers/websocket.js";
import httpRoutes from "./routes/api.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

import { WSAPIschema } from "./graphql/schema/index.js";
import { WSAPIresolvers } from "./graphql/resolver/index.js";

const limiter = RateLimit({
	windowMs: 1 * 60 * 1000,
	max: 100,
});

const app = express();
const server = createServer(app);
websocket(server);

app.set("trust proxy", "172.18.0.0/16");

app.use(limiter);
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cors());

app.use(
	"/graphql",
	graphqlHTTP({
		schema: WSAPIschema,
		rootValue: WSAPIresolvers,
		graphiql: true,
	}),
);

app.use("/api/v1", httpRoutes);

app.get("/{*splat}", (_req, res) => {
	res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

server.listen(process.env.PORT || 5000, () => {
	logger.info(`[app] waktusolat.me is running on port ${process.env.PORT || 5000}`);
	logger.info(
		`[graphql] GraphQL API is running on http://localhost:${process.env.PORT || 5000}/graphql`,
	);
});
