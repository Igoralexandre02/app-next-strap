/**
 * @param {import('koa').Context} ctx
 */
export async function callback(ctx) {

  const { identifier, password } = ctx.request.body;

  if (!identifier || !password) {
    return ctx.badRequest('CPF e senha são obrigatórios');
  }

  const cpf = String(identifier).replace(/\D/g, '');

  const users = await strapi
    .query('plugin::users-permissions.user')
    .findMany({
      where: {
        cpf: cpf,
      },
      populate: ['role'],
    });

  const user = users[0];

  if (!user) {
    return ctx.badRequest('CPF ou senha inválidos');
  }

  if (user.blocked) {
    return ctx.badRequest('Usuário bloqueado');
  }

  const validPassword = await strapi
    .plugin('users-permissions')
    .service('user')
    .validatePassword(password, user.password);

  if (!validPassword) {
    return ctx.badRequest('CPF ou senha inválidos');
  }

  const jwt = await strapi
    .plugin('users-permissions')
    .service('jwt')
    .issue({
      id: user.id,
    });

  return ctx.send({
    jwt,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      cpf: user.cpf,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            type: user.role.type,
          }
        : null,
    },
  });
}