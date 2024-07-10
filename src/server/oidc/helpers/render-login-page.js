import {
  transformQuery,
  transformUsers
} from '~/src/server/oidc/transformers/transform-users.js'

const renderLoginPage = async (allUsers, url, h) => {
  const queryParams = url ? new URL(url).search : ''
  const userRows = transformUsers(allUsers, queryParams)
  const queryRows = transformQuery(queryParams)
  return h.view('oidc/views/login', {
    pageTitle: 'DEFRA ID Login',
    heading: 'DEFRA ID Login',
    userRows,
    debugQueryParams: queryRows
  })
}

export { renderLoginPage }
