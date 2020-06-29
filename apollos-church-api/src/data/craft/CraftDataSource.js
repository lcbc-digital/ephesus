import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';

export default class Craft extends RESTDataSource {
  baseURL = ApollosConfig.CRAFT.URL;

  willSendRequest = (request) => {
    request.headers.set('Authorization', ApollosConfig.CRAFT.GRAPH_TOKEN);
    request.headers.set('Content-Type', 'application/json');
  };

  query = (query, variables) =>
    this.post(
      '/',
      JSON.stringify({
        query,
        variables,
      })
    );
}
