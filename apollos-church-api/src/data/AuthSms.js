import { AuthSms } from '@apollosproject/data-connector-rock';
import { UserInputError } from 'apollo-server';

const { resolver, dataSource: AuthSmsDataSource, schema } = AuthSms;

class dataSource extends AuthSmsDataSource {
  requestSmsLogin = async ({ phoneNumber: phoneNumberInput }) => {
    // E.164 Regex that twilio recommends
    // https://www.twilio.com/docs/glossary/what-e164
    const { valid, phoneNumber, e164 } = this.parsePhoneNumber({
      phoneNumber: phoneNumberInput,
    });

    if (!valid) {
      throw new UserInputError(`${phoneNumber} is not a valid phone number`);
    }

    const { pin, password } = this.generateSmsPinAndPassword();

    const existingUserLogin = await this.request('/UserLogins')
      .filter(`UserName eq '${phoneNumber}'`)
      .first();

    let personOptions = {};

    // Updating PlainTextPassword via Patch doesn't work, so we delete and recreate.
    if (existingUserLogin) {
      // if we have a PersonId on the user login, we should move it over to the new login.
      if (existingUserLogin.personId)
        personOptions = { PersonId: existingUserLogin.personId };

      await this.delete(`/UserLogins/${existingUserLogin.id}`);
    }

    await this.post('/UserLogins', {
      EntityTypeId: 27, // A default setting we use in Rock-person-creation-flow
      UserName: phoneNumber,
      PlainTextPassword: password,
      ...personOptions, // { PersonId: ID } OR null
    });

    await this.context.dataSources.Sms.sendSms({
      to: e164,
      body: `Thanks for logging into the LCBC App! Your login code is ${pin}`,
    });

    return {
      success: true,
      userAuthStatus: existingUserLogin ? 'EXISTING_APP_USER' : 'NONE',
    };
  };
}

export { resolver, schema, dataSource };
