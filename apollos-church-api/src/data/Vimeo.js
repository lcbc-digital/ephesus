/* eslint-disable class-methods-use-this */
import ApollosConfig from '@apollosproject/config';
import { RESTDataSource } from 'apollo-datasource-rest';

class dataSource extends RESTDataSource {
  get token() {
    return ApollosConfig.VIMEO.TOKEN;
  }

  baseURL = 'https://api.vimeo.com/';

  willSendRequest = (request) => {
    request.headers.set('Authorization', `Bearer ${this.token}`);
  };

  getHLSForVideo = async (id) => {
    // captures either vimeo/123 or 123
    const matches = id.match(/\/?(\d+)$/);
    if (matches && matches[1]) {
      const video = JSON.parse(await this.get(`videos/${matches[1]}`));
      return this.findHLSSource(video);
    }
    return null;
  };

  findHLSSource({ files }) {
    const hls = files.find(({ quality }) => quality === 'hls');

    return hls ? hls.link : null;
  }
}

const baseResolver = {
  videos: (root, args, { dataSources: { ContentItem, Vimeo } }) => {
    const vimeoUrls = ContentItem.getVideos(root);
    return vimeoUrls.map((video) => ({
      ...video,
      sources: video.sources.map(({ uri }) => ({
        uri: Vimeo.getHLSForVideo(uri),
      })),
    }));
  },
};

// overrides the video urls for all content item resolvers
const contentItemTypes = Object.keys(ApollosConfig.ROCK_MAPPINGS.CONTENT_ITEM);

const resolver = contentItemTypes.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: baseResolver,
  }),
  {}
);

export { dataSource, resolver };
