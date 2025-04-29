const logger = {
	info: (message) => {
		const date = new Date();
		const formattedDate = date
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		console.log(`[INFO] [${formattedDate}] ${message}`);
	},
	error: (message) => {
		const date = new Date();
		const formattedDate = date
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		console.error(`[ERROR] [${formattedDate}] ${message}`);
	},
	warn: (message) => {
		const date = new Date();
		const formattedDate = date
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		console.warn(`[WARN] [${formattedDate}] ${message}`);
	},
};

export default logger;
