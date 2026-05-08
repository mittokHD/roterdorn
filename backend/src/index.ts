import type { Core } from '@strapi/strapi';

export default {
  /**
   * Runs before the application is initialized.
   * Use this hook to register custom services, middleware, or policies.
   */
  register({ strapi }: { strapi: Core.Strapi }) {},

  /**
   * Runs after the application is initialized, before it starts accepting requests.
   * Use this hook to seed data, set up cron jobs, or run startup logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {},
};
