// init app
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
import Route from './routes/api.js';
import { WSAPIschema } from './graphql/schema/index.js';
import { WSAPIresolvers } from './graphql/resolver/index.js';

// create express app
const app = express();

// set up rate limiter: maximum of five requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 10 requests per windowMs
});

// enable middlewares
app.use(limiter);
app.use(cors());
app.use(express.json());

// set header
app.use((_, res, next) => {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=86400, stale-while-revalidate'
  );
  next();
});

// GraphQL route
app.use(
  '/graphql',
  graphqlHTTP({
    schema: WSAPIschema,
    rootValue: WSAPIresolvers,
    graphiql: true,
  })
);

// init route
app.use('/', Route);

// 404 handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    code: err.status || 500,
    status: 'Not Found.',
    message: `Resource "${req.url}" is not found.`,
    error: err.message,
  });
});

export default app;
