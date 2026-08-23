import initializeDatabase from "../db/db.js"
import logger from "../utils/logger.js"

const waktusolatDb = await initializeDatabase();

const insertVisitor = async (req, res) => {
	const date = new Date().toISOString();
	const clientIp =
		req.headers['x-forwarded-for']?.split(',')[0] ||
		req.headers['x-real-ip'] ||
		req.socket?.remoteAddress;

	if (!clientIp) {
		return res.status(400).json({
			code: 400,
			message: "Unable to determine client IP"
		});
	}

	// bun:sqlite is synchronous — run() returns { changes, lastInsertRowid }
	// and takes no callback. The insert executes immediately; wrap in try/catch.
	try {
		waktusolatDb
			.prepare("INSERT INTO visitors(ip_address, visit_date) VALUES(?, ?)")
			.run(clientIp, date);
	} catch (err) {
		logger.error(`[visitors] failed to record visit: ${err.message}`);
		return res.status(500).json({ code: 500, message: "Failed to record visit" });
	}

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

// Aggregated, anonymized usage stats for public display.
// Never returns raw IPs — only counts.
const getVisitorStats = (_req, res) => {
	const totals = waktusolatDb
		.prepare(
			`SELECT
				COUNT(*)                                 AS total_visits,
				COUNT(DISTINCT ip_address)               AS unique_visitors,
				COUNT(DISTINCT DATE(visit_date))         AS active_days,
				SUM(CASE WHEN DATE(visit_date) = DATE('now')  THEN 1 ELSE 0 END) AS today_visits,
				SUM(CASE WHEN strftime('%Y-%m', visit_date) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) AS month_visits
			FROM visitors`,
		)
		.get();

	const recent = waktusolatDb
		.prepare(
			`SELECT DATE(visit_date) AS day, COUNT(*) AS visits
			 FROM visitors
			 GROUP BY DATE(visit_date)
			 ORDER BY day DESC
			 LIMIT 14`,
		)
		.all()
		.reverse();

	res.status(200).json({
		code: 200,
		data: {
			...totals,
			recent,
		},
	});
};

export { insertVisitor, getVisitors, getVisitorStats };