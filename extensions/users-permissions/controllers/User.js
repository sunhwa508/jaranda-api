'use strict';

const _ = require('lodash');

const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];
  
module.exports = {
  /**
   * Update a/an user record.
   * @return {Object}
   */

   async updateUser(ctx) {
    const advancedConfigs = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const {
      params: { id },
      request: { body },
      state: { userAbility, admin },
    } = ctx;
    const { email, username, password, menus, card_info, age, address } = body;

    const { pm, entity: user } = await findEntityAndCheckPermissions(
      userAbility,
      ACTIONS.edit,
      userModel,
      id
    );

    if (_.has(body, 'menus') && !menus) {
      return ctx.badRequest('menus.notNull');
    }

    if (_.has(body, 'email') && !email) {
      return ctx.badRequest('email.notNull');
    }

    if (_.has(body, 'username') && !username) {
      return ctx.badRequest('username.notNull');
    }

    if (_.has(body, 'age') && !age) {
      return ctx.badRequest('age.notNull');
    }

    if (_.has(body, 'address') && !address) {
      return ctx.badRequest('address.notNull');
    }

    if (_.has(body, 'card_info') && !card_info) {
      return ctx.badRequest('card_info.notNull');
    }

    if (_.has(body, 'password') && !password && user.provider === 'local') {
      return ctx.badRequest('password.notNull');
    }


    if (_.has(body, 'username')) {
      const userWithSameUsername = await strapi
        .query('user', 'users-permissions')
        .findOne({ username });

      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.username.taken',
            message: 'username.alreadyTaken.',
            field: ['username'],
          })
        );
      }
    }


    if (_.has(body, 'menus')) {
      const userWithSameMenus = await strapi
        .query('user', 'users-permissions')
        .findOne({ menus });

      if (userWithSameMenus && userWithSameMenus.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.menus.taken',
            message: 'menus.alreadyTaken.',
            field: ['menus'],
          })
        );
      }
    }


    if (_.has(body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: email.toLowerCase() });

      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.taken',
            message: 'Email already taken',
            field: ['email'],
          })
        );
      }
      body.email = body.email.toLowerCase();
    }

    if (_.has(body, 'age') && advancedConfigs.unique_age) {
      const userWithSameAge = await strapi
        .query('user', 'users-permissions')
        .findOne({ age: age });

      if (userWithSameAge && userWithSameAge.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.age.taken',
            message: 'Age already taken',
            field: ['age'],
          })
        );
      }
      body.age = body.age;
    }

    if (_.has(body, 'card_info') && advancedConfigs.unique_card_info) {
      const userWithSameCardInfo = await strapi
        .query('user', 'users-permissions')
        .findOne({ card_info: card_info });

      if (userWithSameCardInfo && userWithSameCardInfo.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.card_info.taken',
            message: 'card_info already taken',
            field: ['card_info'],
          })
        );
      }
      body.card_info = body.card_info;
    }

    if (_.has(body, 'address') && advancedConfigs.unique_address) {
      const userWithSameAddress = await strapi
        .query('user', 'users-permissions')
        .findOne({ address: address });

      if (userWithSameAddress && userWithSameAddress.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.card_info.taken',
            message: 'card_info already taken',
            field: ['card_info'],
          })
        );
      }
      body.address = body.address;
    }

   
    const sanitizedData = pm.pickPermittedFieldsOf(body, { subject: pm.toSubject(user) });
    const updateData = _.omit({ ...sanitizedData, updated_by: admin.id }, 'created_by');

    if (_.has(body, 'password') && password === user.password) {
      delete updateData.password;
    }

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData);

    ctx.body = pm.sanitize(data, { action: ACTIONS.read });
  },
  }