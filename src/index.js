import { callback } from './extensions/users-permissions/controllers/auth.js';

export default {
    /**
   * @param {{ strapi: import('@strapi/strapi').Core.Strapi }} params
   */
  register({ strapi }) {

    strapi
      .plugin('users-permissions')
      .controller('auth')
      .callback = callback;
  },

  bootstrap() {},
};