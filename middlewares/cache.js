const cache = new Map();

const cacheService = (req, res, next) => {
  const key = req.url;

  const cachedBody = cache.get(key);
  if (cachedBody) {
    return res.status(200).send(cachedBody);
  }

  res.sendResponse = res.send;
  res.send = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };

  next();
};

export { cacheService };
