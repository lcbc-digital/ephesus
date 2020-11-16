import { parseGlobalId } from '@apollosproject/server-core';
import { InMemoryLRUCache } from 'apollo-server-caching';
import CraftDataSource from './data/craft/CraftDataSource';

const craft = new CraftDataSource();
const cache = new InMemoryLRUCache();
craft.initialize({ cache });

export async function createRedirectLink({ req }) {
  try {
    const { itemId } = req.query;
    const { id } = parseGlobalId(itemId);

    const { data } = await craft.query(
      `
query slug($id: [QueryArgument]){
  entry(id: $id){
    url
  }
}
    `,
      { id }
    );
    if (data?.entry?.url) {
      return data.entry.url;
    }
  } catch (e) {
    console.log(e);
  }
  return 'https://lcbcchurch.com/';
}
