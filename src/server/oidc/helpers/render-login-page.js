import { oidcBasePath } from '~/src/server/oidc/oidc-config.js'

const userToLink = (user, allUsers, query) => {
  const queryFirst = query ? '&' : '?'
  return `<li><a id='${user}' href='${oidcBasePath}/authorize${query}${queryFirst}user=${allUsers[user].email}'>${allUsers[user].email}</a> - <i>${allUsers[user].id}</i></li>`
}

const renderLoginPage = async (allUsers, url, h) => {
  const queryParams = url ? new URL(url).search : ''
  const page = `
        <div style="margin: 5%">
        <h1>CDP-Portal-Stubs - Login Stub</h1>
        <pr>Select a user to login as:</pr>
        <ul>
        ${Object.keys(allUsers)
          .map((user) => userToLink(user, allUsers, queryParams))
          .join('')}
        </ul>

        <br/><br/>
        <pre>DEBUG:\n${decodeURIComponent(
          queryParams.replace('?', '').replaceAll('&', '\n')
        )}</pre>
        </div>
        `
  return h.response(page).header('content-type', 'text/html').code(200)
}

export { renderLoginPage }
