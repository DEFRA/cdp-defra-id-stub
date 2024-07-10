import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

function transformUser(user, queryFirst) {
  return [
    {
      text: user.email
    },
    {
      html: `<a href="${oidcBasePath}/authorize${queryFirst}user=${user.email}">Log in</a>`
    },
    {
      html: `<a href="${oidcBasePath}/register/${user.userId}/expire">Expire</a>`
    }
  ]
}

function transformUsers(users, query) {
  const queryFirst = query ? '&' : '?'
  return users.map((u) => transformUser(u, `${query}${queryFirst}`))
}

function transformQueryRow(param) {
  return `<div class="govuk-summary-list__row">
      <dt class="govuk-summary-list__key">${param[0]}</dt>
      <dd class="govuk-summary-list__value">${param[1]}</dd>
   </div>`
}

function transformQuery(query) {
  const querySplit = query.replace('?', '').split('&')
  const querySanitised = querySplit.map(decodeURIComponent)
  const queries = querySanitised.map((q) => q.split('='))
  const response =
    '<dl class="govuk-summary-list">' +
    queries.map(transformQueryRow).join('') +
    '</dl>'
  return response
}

export { transformQuery, transformUser, transformUsers }
