import { RockConstants } from '@apollosproject/data-connector-rock';

class dataSource extends RockConstants.dataSource {
  async createOrFindInteractionComponent({
    componentName,
    channelId,
    entityId,
  }) {
    return this.findOrCreate({
      model: 'InteractionComponents',
      objectAttributes: {
        Name: componentName,
        InteractionChannelId: channelId, // In Rock 11, this field is InteractionChannel instead of Channel.
        EntityId: entityId,
      },
    });
  }
}
// eslint-disable-next-line import/prefer-default-export
export { dataSource };
