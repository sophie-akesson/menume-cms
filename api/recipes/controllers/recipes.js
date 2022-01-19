const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    let ingredientIds = [];
    const { name, servings, ingredients, description } = ctx.request.body;

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.author = ctx.state.user.id;
      entity = await strapi.services.recipes.create(data, { files });
    } else {
      ingredients.forEach(async (ingredient) => {
        const postedIngredient = await strapi.services.ingredients.create(
          ingredient
        );
        ingredientIds.push(postedIngredient.id);
      });

      ctx.request.body.author = ctx.state.user.id;
      entity = await strapi.services.recipes.create({
        name,
        servings,
        description,
        author: ctx.request.body.author,
        ingredients: ingredientIds,
      });
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
    const { ingredients } = ctx.request.body;
    let updatedRecipe = ctx.request.body;
    let entity;

    // console.log(ingredients);

    const [recipe] = await strapi.services.recipes.find({
      id: ctx.params.id,
      "author.id": ctx.state.user.id,
    });

    //Reduce fields in recipe.ingredients for next step
    const recipeIngredients = recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      amount: ingredient.amount,
      metric: ingredient.metric,
      name: ingredient.name,
      category: ingredient.category,
    }));

    if (!recipe) {
      return ctx.unauthorized(
        `Du har inte tillåtelse att utföra denna åtgärd.`
      );
    }

    //Make new array of any removed ingredients
    const removedIngredients = recipe.ingredients.filter(
      ({ id: id1 }) => !ingredients.some(({ id: id2 }) => id1 === id2)
    );

    //Delete removed ingredients
    if (removedIngredients) {
      removedIngredients.forEach(async (ingredientToRemove) => {
        const removedIngredient = await strapi.services.ingredients.delete({
          id: ingredientToRemove.id,
        });

        for (let i = 0; i < updatedRecipe.ingredients.length; i++) {
          if (updatedRecipe.ingredients[i].id === removedIngredient.id) {
            updatedRecipe.ingredients.splice(i, 1);
            break;
          }
        }
      });
    }

    //Make new array of any added ingredients
    const addedIngredients = ingredients.filter(
      ({ id: id1 }) => !recipe.ingredients.some(({ id: id2 }) => id1 === id2)
    );

    //Post new ingredients
    if (addedIngredients) {
      addedIngredients.forEach(async (ingredientToAdd) => {
        const newIngredient = {
          amount: ingredientToAdd.amount,
          metric: ingredientToAdd.metric,
          name: ingredientToAdd.name,
          category: ingredientToAdd.category,
        };
        const postedIngredient = await strapi.services.ingredients.create(
          newIngredient
        );

        for (let i = 0; i < updatedRecipe.ingredients.length; i++) {
          if (updatedRecipe.ingredients[i].id === "") {
            updatedRecipe.ingredients[i].id = postedIngredient.id;
            break;
          }
        }
      });
    }

    //Find updated ingredients
    const updatedIngredients = ingredients.reduce((a, ingredient) => {
      recipeIngredients.forEach((recipeIngredient) => {
        if (
          ingredient.id === recipeIngredient.id &&
          JSON.stringify(ingredient) !== JSON.stringify(recipeIngredient)
        ) {
          a.push(ingredient);
        }
      });
      return a;
    }, []);

    //Update each updated ingredient
    if (updatedIngredients) {
      updatedIngredients.forEach(async (ingredient) => {
        await strapi.services.ingredients.update(
          { id: ingredient.id },
          ingredient
        );
      });
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.recipes.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.recipes.update({ id }, updatedRecipe);
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

    const recipes = await strapi.services.recipes.find({
      "author.id": ctx.state.user.id,
    });

    if (!recipes) {
      return ctx.unauthorized(
        `Du har inte tillåtelse att utföra denna åtgärd.`
      );
    }

    const menu = await strapi.services.menu.find({}, [
      "recipe",
      "recipe.author",
    ]);

    if (menu.length) {
      const menuByAuthor = menu.filter(
        (item) => item.recipe.author.username === ctx.query.author
      );

      //Kolla ifall reptet är en del av en befintlig meny
      const shouldNotDelete = menuByAuthor.some(
        (menuItem) => menuItem.recipe.id === parseInt(id)
      );

      //Är receptet en del av en befintlig meny får man inte ta bort det
      if (shouldNotDelete) {
        return ctx.forbidden(
          `Du kan inte ta bort ett recept som finns i din befintliga meny.`
        );
      }
    }

    let ingredients = [];

    recipes.forEach((recipe) => {
      if (recipe.id === parseInt(id)) {
        recipe.ingredients.forEach((ingredient) => {
          ingredients.push(ingredient.id);
        });
      }
    });

    ingredients.forEach(async (item) => {
      await strapi.services.ingredients.delete({ id: item });
    });

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
