import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';
import { get } from 'lodash';

const { resolver, schema } = Feature;

class dataSource extends Feature.dataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
  };

  async mostRecentSermonAlgorithm() {
    const { ContentItem } = this.context.dataSources;

    const item = await ContentItem.getMostRecentSermon();
    return [
      {
        id: createGlobalId(`${item.id}`, 'ActionListAction'),
        title: item.title,
        subtitle: get(item, 'parent.title'),
        relatedNode: { ...item, __type: ContentItem.resolveType(item) },
        image: ContentItem.getCoverImage(item),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(item),
      },
    ];
  }
}

export { resolver, schema, dataSource };
