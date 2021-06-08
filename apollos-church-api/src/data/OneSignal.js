import ApollosConfig from '@apollosproject/config';
import * as OneSignal from '@apollosproject/data-connector-onesignal';

const { ONE_SIGNAL } = ApollosConfig;
const { resolver, schema, dataSource: OneSignalDataSource } = OneSignal;

class dataSource extends OneSignalDataSource {
  async updateExternalUserId({ playerId, userId, campusId }) {
    return this.put(`players/${playerId}`, {
      app_id: ONE_SIGNAL.APP_ID,
      external_user_id: userId,
      tags: { campusId },
    });
  }

  async updatePushSettings({ enabled, pushProviderUserId }) {
    const { Auth, PersonalDevice, Campus } = this.context.dataSources;

    const currentUser = await Auth.getCurrentPerson();

    if (enabled != null && pushProviderUserId != null)
      await PersonalDevice.updateNotificationsEnabled(
        pushProviderUserId,
        enabled
      );

    if (pushProviderUserId != null) {
      const campus = await Campus.getForPerson({
        originId: currentUser.id,
        originType: 'rock',
      });
      await this.updateExternalUserId({
        playerId: pushProviderUserId,
        userId: currentUser.primaryAliasId,
        campusId: campus?.id,
      });
    }
    return currentUser;
  }
}

export { resolver, schema, dataSource };
