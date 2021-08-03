'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async update(ctx) {
        const { id } = ctx.params;
    
        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.menus.update({ id }, data, {
            files,
          });
        } else {
          entity = await strapi.services.menus.update({ id }, ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.menus });
      },

};
