# Menume CMS

This application is used with Next and uses Rest API along with SQLite. Custom made controllers have been made in some cases, these will be in the API folder. There are two major reasons behind this;

1. Users should not be able to access each other's content
2. The data model uses hierarchies and relations which means that custom controllers are necessary. For example: When deleting a recipe, its ingredients should be deleted along with it.

Strapi was chosen based on its popularity. Having no prior experience with Strapi the developer wanted to try it out, to get some experience with it. Seeing as Strapi had many options for backend it seemed like a good fit.

## Getting Started

To run the development server:

```bash
npm run dev
```

Open [http://localhost:1337/admin](http://localhost:3000/admin) with your browser to access the admin page.
