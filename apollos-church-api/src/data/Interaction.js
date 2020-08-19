import { Interactions } from '@apollosproject/data-connector-rock';
import { createGlobalId, parseGlobalId } from '@apollosproject/server-core';

const { resolver, schema } = Interactions;

class dataSource extends Interactions.dataSource {
  async updateSeriesStarted({ id }) {
    const { ContentItem } = this.context.dataSources;
    // Get all the parents
    const seriesParent = await ContentItem.getParent(id);
    // Check to see if we have started the series before
    if (!seriesParent) return;
    const parentType = ContentItem.resolveType(seriesParent);
    const nodeId = createGlobalId(seriesParent.id, parentType);
    const otherInteractions = await this.getInteractionsForCurrentUserAndNodes({
      nodeIds: [nodeId],
      actions: ['SERIES_START'],
    });
    // If we haven't, mark it as started
    if (!otherInteractions.length) {
      await this.createNodeInteraction({
        nodeId,
        action: 'SERIES_START',
        additional: false, // we pass this prop to avoid recursive interaction creation
      });
    }
  }

  async createNodeInteraction({ nodeId, action, additional = true }) {
    const {
      dataSources: { RockConstants, Auth },
    } = this.context;
    const { id, __type } = parseGlobalId(nodeId);

    const entityType = await RockConstants.modelType(__type);

    const interactionComponent = await RockConstants.interactionComponent({
      entityId: id,
      entityTypeId: entityType ? entityType.id : null,
      entityTypeName: entityType ? entityType.friendlyName : 'ApollosEntity',
    });

    const currentUser = await Auth.getCurrentPerson();
    await this.post('/Interactions', {
      PersonAliasId: currentUser.primaryAliasId,
      InteractionComponentId: interactionComponent.id,
      Operation: action,
      InteractionDateTime: new Date().toJSON(),
      InteractionSummary: `${action}`,
      ForeignKey: nodeId,
    });

    if (additional) {
      this.createAdditionalInteractions({ id, __type, action });
    }

    return {
      success: true,
      nodeId,
    };
  }
}

export { dataSource, resolver, schema };
