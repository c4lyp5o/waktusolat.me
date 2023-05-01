import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
import Route from './routes/api.js';
import { WSAPIschema } from './graphql/schema/index.js';
import { WSAPIresolvers } from './graphql/resolver/index.js';

const app = express();

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.use((_, res, next) => {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=86400, stale-while-revalidate'
  );
  next();
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: WSAPIschema,
    rootValue: WSAPIresolvers,
    graphiql: true,
  })
);

app.use('/', Route);

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send({
    code: err.status || 500,
    status: 'Not Found.',
    message: `Resource "${req.url}" is not found.`,
    error: err.message,
  });
});

export default app;
