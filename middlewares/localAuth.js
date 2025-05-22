const localAuth = (req, res, next) => {
    const rawIp = req.connection.remoteAddress?.replace('::ffff:', '') || req.ip;

    if (rawIp === "127.0.0.1" || rawIp === "::1") {
        return next();
    }

    res.status(403).json({ message: "Forbidden" });
};

export default localAuth;