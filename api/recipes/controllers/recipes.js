const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.recipes.create(data, { files });
    } else {
      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.recipes.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.recipes });
  },

  /**
   * Update a record.
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [recipes] = await strapi.services.recipes.find({
      id: ctx.params.id,
      "author.id": ctx.state.user.id,
    });

    if (!recipes) {
      return ctx.unauthorized(
        `Du har inte tillåtelse att utföra denna åtgärd.`
      );
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.recipes.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.recipes.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.recipes });
  },

  /**
   * Delete a record.
   *
   * @return {Object}
   */

  async delete(ctx) {
    const { id } = ctx.params;

    let entity;

    const [recipes] = await strapi.services.recipes.find({
      id: ctx.params.id,
      "author.id": ctx.state.user.id,
    });

    if (!recipes) {
      return ctx.unauthorized(
        `Du har inte tillåtelse att utföra denna åtgärd.`
      );
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.recipes.delete({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.recipes.delete({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.recipes });
  },
};
