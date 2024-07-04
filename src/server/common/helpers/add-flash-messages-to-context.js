import { sessionNames } from '~/src/server/common/constants/session-names.js'

async function addFlashMessagesToContext(request, h) {
  const response = request.response

  if (response.variety === 'view') {
    const notifications = request.yar.flash(sessionNames.notifications)
    const globalValidationFailures = request.yar.flash(
      sessionNames.globalValidationFailures
    )
    await request.yar.commit(h)

    response.source.context = {
      ...response.source.context,
      notifications,
      globalValidationFailures
    }
  }

  return h.continue
}

export { addFlashMessagesToContext }
