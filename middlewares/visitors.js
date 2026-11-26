import initializeDatabase from "../db/db.js";
import logger from "../utils/logger.js";

const waktusolatDb = await initializeDatabase();

// One "visit" per IP within this window — throttles bots, refreshes, and
// client-side nav (quran -> chat -> about in one sitting counts as 1 visit).
const VISIT_WINDOW_MS = 15 * 60 * 1000;

const insertVisitor = async (req, res) => {
	const date = new Date().toISOString();
	const clientIp = req.ip;

	if (!clientIp) {
		return res.status(400).json({
			code: 400,
			message: "Unable to determine client IP",
		});
	}

	// Dedup: if this IP already has a visit inside the window, skip the insert.
	// visit_date is ISO-8601 UTC (toISOString), so lexicographic compare works.
	const cutoff = new Date(Date.now() - VISIT_WINDOW_MS).toISOString();
	const recent = waktusolatDb
		.prepare("SELECT 1 FROM visitors WHERE ip_address = ? AND visit_date >= ? LIMIT 1")
		.get(clientIp, cutoff);
	if (recent) {
		return res.status(200).json({
			message: "Thanks for visiting us!",
			data: { ip_address: clientIp, visit_date: date, deduped: true },
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

// Admin raw log, newest first. Paginated so the response stays bounded as
// the table grows: ?limit= (default 500, max 5000) & ?offset=.
const DEFAULT_PAGE = 500;
const MAX_PAGE = 5000;
const toInt = (value, fallback, max) => {
	const n = Number.parseInt(value, 10);
	if (!Number.isFinite(n) || n < 0) return fallback;
	return Math.min(n, max);
};

const getVisitors = (req, res) => {
	const limit = toInt(req.query?.limit, DEFAULT_PAGE, MAX_PAGE);
	const offset = toInt(req.query?.offset, 0, Number.MAX_SAFE_INTEGER);
	const result = waktusolatDb
		.prepare("SELECT * FROM visitors ORDER BY id DESC LIMIT ? OFFSET ?")
		.all(limit, offset);
	res.status(200).json(result);
};

// Aggregated, anonymized usage stats for public display.
// Never returns raw IPs — only counts. The aggregates scan the whole table,
// and the route is public and uncached upstream, so the result is memoized
// for STATS_TTL_MS (a minute of staleness is fine for a visitor counter).
const STATS_TTL_MS = 60 * 1000;
let statsMemo = { at: 0, data: null };

const computeVisitorStats = () => {
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

	return { ...totals, recent };
};

const getVisitorStats = (_req, res) => {
	const now = Date.now();
	if (!statsMemo.data || now - statsMemo.at >= STATS_TTL_MS) {
		statsMemo = { at: now, data: computeVisitorStats() };
	}
	res.status(200).json({ code: 200, data: statsMemo.data });
};

export { getVisitorStats, getVisitors, insertVisitor };
