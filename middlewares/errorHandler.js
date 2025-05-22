import logger from "../utils/logger";

const errorHandler = (err, _req, res, _next) => {
	logger.error(err.stack);
	res.status(500).json({ message: "Internal Server Error" });
};

export default errorHandler;
