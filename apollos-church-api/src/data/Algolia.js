import ApollosConfig from '@apollosproject/config';
import { isEmpty } from 'lodash';
import moment from 'moment-timezone';
import Redis from 'ioredis';
import basicAuth from 'express-basic-auth';
import {
  resolver,
  dataSource,
  schema,
} from '@apollosproject/data-connector-algolia-search';

const { ROCK } = ApollosConfig;

const { REDIS_URL } = process.env;

let client;
let subscriber;
let queueOpts;

if (REDIS_URL) {
  client = new Redis(REDIS_URL);
  subscriber = new Redis(REDIS_URL);

  // Used to ensure that N+3 redis connections are not created per queue.
  // https://github.com/OptimalBits/bull/blob/develop/PATTERNS.md#reusing-redis-connections
  queueOpts = {
    createClient(type) {
      switch (type) {
        case 'client':
          return client;
        case 'subscriber':
          return subscriber;
        default:
          return new Redis(REDIS_URL);
      }
    },
  };
}

const jobs = ({ getContext, queues, app }) => {
  const FullIndexQueue = queues.add('algolia-full-index-queue', queueOpts);
  const DeltaIndexQueue = queues.add('algolia-delta-index-queue', queueOpts);

  FullIndexQueue.process(async () => {
    const context = getContext();
    return context.dataSources.Search.indexAll();
  });

  DeltaIndexQueue.process(async () => {
    const context = getContext();
    const pastJobs = await DeltaIndexQueue.getCompleted();
    const timestamp = isEmpty(pastJobs)
      ? moment()
          .subtract(1, 'day')
          .toDate()
      : pastJobs.map((j) => j.opts.timestamp).sort((a, b) => {
          if (a > b) {
            return -1;
          }
          if (a < b) {
            return 1;
          }
          return 0;
        })[0];
    const datetime = moment(timestamp)
      .tz(ROCK.TIMEZONE)
      .format()
      .split(/[-+]\d+:\d+/)[0];
    return context.dataSources.Search.deltaIndex({ datetime });
  });

  FullIndexQueue.add(null, { repeat: { cron: '15 3 * * 1' } });
  DeltaIndexQueue.add(null, { repeat: { cron: '15 3 * * *' } });

  const auth = basicAuth({
    users: {
      [ApollosConfig.APP.JOBS_USERNAME]: ApollosConfig.APP.JOBS_PASSWORD,
    },
  });

  app.post('/admin/queues/algolia-full-index-queue', auth, (req, res) => {
    FullIndexQueue.add(null);
    res.sendStatus(201);
  });
  app.post('/admin/queues/algolia-delta-index-queue', auth, (req, res) => {
    DeltaIndexQueue.add(null);
    res.sendStatus(201);
  });
  // Uncomment this to trigger an index right now.
  // FullIndexQueue.add(null);
  // DeltaIndexQueue.add(null);
};

export { jobs, resolver, dataSource, schema };
