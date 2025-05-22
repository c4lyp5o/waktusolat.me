import initializeDatabase from "../db/db.js"

const waktusolatDb = await initializeDatabase();

const insertVisitor = async (req, res) => {
	const date = new Date().toISOString();
	const clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
		req.headers['x-real-ip'] ||
		req.socket.remoteAddress;

	if (!clientIp) {
		return res.status(400).json({
			code: 400,
			message: "Unable to determine client IP"
		});
	}

	await new Promise((resolve, reject) => {
		waktusolatDb.run(
			"INSERT INTO visitors(ip_address, visit_date) VALUES(?, ?)",
			[clientIp, date],
			(err) => {
				if (err) reject(err);
				resolve();
			}
		);
	});

	return res.status(200).json({
		message: "Thanks for visiting us!",
		data: {
			ip_address: clientIp,
			visit_date: date,
		},
	});
};

const getVisitors = (_req, res) => {
	const result = waktusolatDb
		.prepare("SELECT * FROM visitors")
		.all();
	res.status(200).json(result);
};

export { insertVisitor, getVisitors };