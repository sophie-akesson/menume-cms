const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Find and populate recipe and ingredients.
   *
   * @return {Object}
   */

  async findByAuthor(ctx) {
    let entity;

    const allMenuItems = await strapi.services.menu.find({}, [
      "recipe",
      "recipe.author",
      "recipe.ingredients",
    ]);

    entity = allMenuItems.filter(
      (item) => item.recipe.author.username === ctx.query.author
    );

    return sanitizeEntity(entity, { model: strapi.models.menu });
  },

  /**
   * Delete all records.
   *
   * @return {Object}
   */

  async deleteAll(ctx) {
    let entity;

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.menu.delete(
        { "recipe.author.username": ctx.query.author },
        data,
        {
          files,
        }
      );
    } else {
      entity = await strapi.services.menu.delete(
        { "recipe.author.username": ctx.query.author },
        ctx.request.body
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.menu });
  },
};
