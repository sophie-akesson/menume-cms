const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Delete all records.
   *
   * @return {Object}
   */

  async deleteAll(ctx) {
    let entity;

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.menu.delete({}, data, {
        files,
      });
    } else {
      entity = await strapi.services.menu.delete({}, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.menu });
  },
};
