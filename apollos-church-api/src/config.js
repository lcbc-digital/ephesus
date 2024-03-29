import path from 'path';
import fetch from 'node-fetch';
import dotenv from "dotenv/config"; // eslint-disable-line
import ApollosConfig from '@apollosproject/config';

ApollosConfig.loadYaml({
  configPath: path.join(
    __dirname,
    '..',
    process.env.DATABASE_CONTENT === 'true'
      ? 'config.postgres.yml'
      : 'config.yml'
  ),
});

// defaults
ApollosConfig.loadJs({
  ROCK: { TIMEZONE: ApollosConfig?.ROCK?.TIMEZONE || 'America/New_York' },
});

// autodetect some settings
(async () => {
  if (!ApollosConfig.ROCK) return;
  if (!ApollosConfig.ROCK.URL || !ApollosConfig.ROCK.API_TOKEN)
    throw new Error('ROCK_URL and ROCK_TOKEN variables are required!');

  let res;

  // plugin
  res = await fetch(
    `${ApollosConfig.ROCK.URL}/api/RestControllers?$select=Name`,
    { headers: { 'Authorization-Token': ApollosConfig.ROCK.API_TOKEN } }
  );
  const hasPlugin = (await res.json())
    .map(({ Name }) => Name)
    .includes('Apollos');
  if (hasPlugin) console.log('Apollos Rock plugin detected!');
  ApollosConfig.loadJs({ ROCK: { USE_PLUGIN: hasPlugin } });

  // version
  res = await fetch(
    `${ApollosConfig.ROCK.URL}/api/Utility/GetRockSemanticVersionNumber`,
    { headers: { 'Authorization-Token': ApollosConfig.ROCK.API_TOKEN } }
  );
  const version = (await res.text()).split('.');
  console.log(`Rock Version: ${version[1]}`);
  ApollosConfig.loadJs({ ROCK: { VERSION: version[1] } });

  const { data } = await fetch(`${ApollosConfig.CRAFT.URL}/`, {
    method: 'POST',
    headers: {
      Authorization: ApollosConfig.CRAFT.GRAPH_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
    query {
        categories(
          groupId: 9
          hasDescendants: true
        ) {
          id
          title
        }
      }`,
      variables: {},
    }),
  }).then((res) => res.json());
  ApollosConfig.loadJs({
    TABS: {
      READ: [
        ...ApollosConfig.TABS.READ.slice(0, -1), // All the items except news
        ...data.categories.map(({ id, title }) => ({
          algorithms: [
            {
              type: 'CHANNEL',
              arguments: {
                channelId: { categoryId: id, source: 'CategoryChildren' },
                first: 3,
              },
            },
          ],
          type: 'HorizontalCardList',
          subtitle: title,
          primaryAction: {
            action: 'OPEN_CHANNEL',
            title: 'View All',
            relatedNode: {
              __typename: 'ContentChannel',
              id: { categoryId: id, source: 'CategoryChildren' },
              name: title,
            },
          },
        })),
        ...ApollosConfig.TABS.READ.slice(-1), // Put news back in at the bottom
      ],
    },
  });
})();
