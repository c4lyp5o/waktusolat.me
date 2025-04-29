import { db } from "../db/db.js";

const insertVisitor = (req, res) => {
	const date = new Date().toISOString();
	db.run(
		"INSERT INTO visitors(ip_address, visit_date) VALUES(?, ?)",
		[req.ip, date],
		(err) => {
			if (err) {
				return res.status(500).json({ code: 500, message: err.message });
			}
			res.status(200).json({
				message: "Thanks for visiting us!",
				data: {
					ip_address: req.ip,
					visit_date: date,
				},
			});
		},
	);
};

const getVisitors = (req, res) => {
	db.all("SELECT * FROM visitors", [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.status(200).json(rows);
	});
};

export { insertVisitor, getVisitors };
