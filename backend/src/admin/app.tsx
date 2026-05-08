import type { StrapiApp } from '@strapi/strapi/admin';

// Admin panel customization entry point.
// Extend this file to add custom admin UI behavior, branding, or locale support.
export default {
  config: {
    // Add supported locales here if i18n plugin is used.
    // Example: locales: ['de', 'fr']
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    // Called after the admin app is bootstrapped.
    // Use this to register custom plugins or extend existing ones.
  },
};
