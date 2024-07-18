import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

function transformUser(user, loginQuery) {
  const loginLink = loginQuery
    ? {
        html: `<a href="${oidcBasePath}/authorize${loginQuery}">Log in</a>`
      }
    : {}
  return [
    {
      text: user.email
    },
    ...(loginQuery ? [loginLink] : []),
    {
      html: `<a href="${oidcBasePath}/register/${user.id}/expire">Expire</a>`
    }
  ]
}

function transformUsers(users, query) {
  return users.map((u) =>
    query ? transformUser(u, `${query}&user=${u.email}`) : transformUser(u)
  )
}

function transformQueryRow(param) {
  return `<div class="govuk-summary-list__row">
      <dt class="govuk-summary-list__key">${param[0]}</dt>
      <dd class="govuk-summary-list__value">${param[1]}</dd>
   </div>`
}

function transformQuery(query) {
  const querySplit = query.replace('?', '').split('&') ?? []
  const querySanitised = querySplit.map(decodeURIComponent)
  const queries = querySanitised.map((q) => q.split('='))
  const response =
    '<dl class="govuk-summary-list">' +
    queries.map(transformQueryRow).join('') +
    '</dl>'
  return response
}

export { transformQuery, transformUser, transformUsers }
