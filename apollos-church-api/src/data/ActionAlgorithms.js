/* eslint-disable class-methods-use-this */
import { ActionAlgorithm } from '@apollosproject/data-connector-rock';
import { parseGlobalId } from '@apollosproject/server-core';
import { get } from 'lodash';
import fetch from 'node-fetch';
import moment from 'moment';

class dataSource extends ActionAlgorithm.dataSource {
  ACTION_ALGORITHMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHMS,
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
    SECTION: this.sectionFeature.bind(this),
    CAMPUS: this.campusFeature.bind(this),
    VERSE_OF_THE_DAY: this.verseOfTheDayAlgorithm.bind(this),
    START_SOMETHING_NEW: this.startSomethingNewAlgorithm.bind(this),
    CHANNEL: this.channelFeature.bind(this),
  };

  async verseOfTheDayAlgorithm() {
    const verseOfTheDay = await fetch(
      `https://developers.youversionapi.com/1.0/verse_of_the_day/${moment().dayOfYear()}?version_id=12`,
      {
        headers: {
          'X-YouVersion-Developer-Token': 'UKe3tMsbC7Rpt55oXjwgI4In__Y',
          'Accept-Language': 'en',
          Accept: 'application/json',
        },
      }
    ).then((result) => result.json());

    const imageUrl = get(verseOfTheDay, 'image.url', '')
      .replace('{width}', 800)
      .replace('{height}', 800);

    return [
      {
        id: 'verse-of-the-day',
        title: '',
        subtitle: '',
        labelText: 'Verse of the Day',
        relatedNode: {
          url: get(verseOfTheDay, 'verse.url')
            .replace('/12/', '/116/')
            .replace('+', '-'),
          id: JSON.stringify({ verseOfTheDay }),
          __type: 'Url',
        },
        image: { sources: [{ uri: imageUrl }] },
        action: 'OPEN_URL',
        hasAction: false,
      },
    ];
  }

  async sectionFeature({ section }) {
    const { ContentItem, Feature } = this.context.dataSources;
    Feature.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });

    const items = await ContentItem.getBySection(section);

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'parent.title'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async channelFeature({ channelId, ...args }) {
    const { ContentChannel, ContentItem } = this.context.dataSources;
    // Feature.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });

    const items = await ContentChannel.byChildren(channelId, args);

    return items.edges.map(({ node: item }, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'parent.title'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async campusFeature() {
    const { ContentItem, Feature } = this.context.dataSources;
    Feature.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });

    if (!this.context.campusId) return [];

    const rockCampusId = parseGlobalId(this.context.campusId).id;

    const items = await ContentItem.getByCampusId({
      campusId: rockCampusId,
    });

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'parent.title'),
      relatedNode: { ...item, __typename: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async mostRecentSermonAlgorithm() {
    const { ContentItem } = this.context.dataSources;

    const item = await ContentItem.getMostRecentSermon();
    return [
      {
        id: `${item.id}`,
        title: item.title,
        subtitle: get(item, 'parent.title'),
        relatedNode: { ...item, __type: ContentItem.resolveType(item) },
        image: ContentItem.getCoverImage(item),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(item),
      },
    ];
  }

  async seriesInProgressAlgorithm({ limit = 3 } = {}) {
    const { ContentItem, Feature } = this.context.dataSources;
    Feature.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });

    const items = await ContentItem.getSeriesWithUserProgress();

    return items.slice(0, limit).map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async startSomethingNewAlgorithm({ limit = 3 } = {}) {
    const { ContentItem, Feature } = this.context.dataSources;
    Feature.setCacheHint({ maxAge: 0, scope: 'PRIVATE' });

    const items = await ContentItem.getNewSeries();

    return items.slice(0, limit).map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }
}

// eslint-disable-next-line import/prefer-default-export
export default { dataSource };
