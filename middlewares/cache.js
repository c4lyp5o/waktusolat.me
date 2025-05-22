const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

class CacheStats {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.size = 0;
  }
}

class CacheItem {
  constructor(data, headers) {
    this.data = data;
    this.headers = headers;
    this.timestamp = Date.now();
    this.lastAccessed = Date.now();
  }

  isExpired() {
    return Date.now() - this.timestamp > CACHE_DURATION;
  }

  touch() {
    this.lastAccessed = Date.now();
  }
}

class CacheService {
  constructor() {
    this.cache = new Map();
    this.stats = new CacheStats();

    // Run cleanup every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  generateKey(req) {
    return `${req.method}:${req.url}:${JSON.stringify(req.query)}`;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && !item.isExpired()) {
      item.touch();
      this.stats.hits++;
      return item;
    }
    if (item) {
      this.cache.delete(key);
    }
    this.stats.misses++;
    return null;
  }

  set(key, data, headers) {
    this.cleanup();
    this.cache.set(key, new CacheItem(data, headers));
    this.stats.size = this.cache.size;
  }

  cleanup() {
    // Remove expired items
    for (const [key, item] of this.cache.entries()) {
      if (item.isExpired()) {
        this.cache.delete(key);
      }
    }

    // Remove oldest if over size limit
    if (this.cache.size > MAX_CACHE_SIZE) {
      const sortedEntries = [...this.cache.entries()]
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      for (let i = 0; i < sortedEntries.length - MAX_CACHE_SIZE; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }

    this.stats.size = this.cache.size;
  }

  invalidate(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    this.stats.size = this.cache.size;
  }

  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }
}

const cacheInstance = new CacheService();

const cacheService = (req, res, next) => {
  // Only cache GET and HEAD requests
  if (!['GET', 'HEAD'].includes(req.method)) {
    return next();
  }

  const key = cacheInstance.generateKey(req);
  const cachedItem = cacheInstance.get(key);

  if (cachedItem) {
    // Apply cached headers
    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.entries(cachedItem.headers).forEach(([name, value]) => {
      res.setHeader(name, value);
    });
    return res.status(200).send(cachedItem.data);
  }

  // Capture headers and response
  res.sendResponse = res.send;
  res.send = (body) => {
    const headers = res.getHeaders();
    cacheInstance.set(key, body, headers);
    res.sendResponse(body);
  };

  next();
};

// Cache management endpoints
const getCacheStats = (_req, res) => {
  res.json(cacheInstance.getStats());
};

const invalidateCache = (req, res) => {
  const pattern = req.query.pattern || '.*';
  cacheInstance.invalidate(pattern);
  res.json({ message: 'Cache invalidated', pattern });
};

export { cacheService, getCacheStats, invalidateCache };
