/* eslint-disable class-methods-use-this */
import ApollosConfig from '@apollosproject/config';
import { RESTDataSource } from 'apollo-datasource-rest';

class dataSource extends RESTDataSource {
  get token() {
    return ApollosConfig.VIMEO.TOKEN;
  }

  baseURL = 'https://api.vimeo.com/';

  willSendRequest(request) {
    request.headers.set('Authorization', `Bearer ${this.token}`);
  }

  async getHLSForVideo(id) {
    const {
      dataSources: { Cache },
    } = this.context;
    // captures either vimeo/123 or 123
    const cachedVideo = await Cache.get({
      key: ['vimeo', id],
    });

    if (cachedVideo) return cachedVideo;

    const matches = id.match(/\/?(\d+)$/);
    if (matches && matches[1]) {
      const video = JSON.parse(await this.get(`videos/${matches[1]}`));
      const source = this.findHLSSource(video);

      await Cache.set({
        key: ['vimeo', id],
        data: source,
      });
      return source;
    }
    return null;
  }

  findHLSSource({ files }) {
    const hls = files.find(({ quality }) => quality === 'hls');

    return hls ? hls.link : null;
  }
}

export { dataSource };
