/* eslint-disable class-methods-use-this */
import { RESTDataSource } from 'apollo-datasource-rest';

class dataSource extends RESTDataSource {
  baseURL = 'https://lcbcchurch.wistia.com/embed/medias/';

  // willSendRequest = (request) => {};

  async getHLSForVideo(id) {
    // captures either vimeo/123 or 123
    const matches = id.match(/\/?(\w+)$/);
    if (matches && matches[1]) {
      const video = await this.getWithCache(matches[1]);
      return this.findHLSSource(video);
    }
    return null;
  }

  async getImage(id) {
    const matches = id.match(/\/?(\w+)$/);
    if (matches && matches[1]) {
      const video = await this.getWithCache(matches[1]);
      return this.findJPGSource(video);
    }
    return null;
  }

  async getWithCache(id) {
    const {
      dataSources: { Cache },
    } = this.context;

    const cachedVideo = await Cache.get({
      key: ['wista', id],
    });

    if (cachedVideo) return cachedVideo;

    const result = await this.get(`${id}.json`);

    await Cache.set({
      key: ['wistia', id],
      data: result,
    });

    return result;
  }

  async findHLSSource({ media }) {
    const sortedAssets = media.assets.sort((a, b) => b.width - a.width);
    const hls =
      sortedAssets.find(({ type }) => type === 'hd_mp4_video') ||
      sortedAssets.find(({ type }) => type === 'original');

    return hls ? `${hls.url.split('.bin')[0]}.m3u8?origin_v2=1` : null;
  }

  findJPGSource({ media }) {
    const jpg = media.assets.find(({ type }) => type === 'still_image');

    return jpg ? `${jpg.url.split('.bin')[0]}.jpeg` : null;
  }
}

export { dataSource };
