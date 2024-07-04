function buildErrorMessages(path, value) {
  const object = {}
  path.reduce((obj, item) => (obj[item] = { ...value }), object)

  return object
}

function buildErrorDetails(errorDetails = []) {
  return errorDetails.reduce((errors, detail) => {
    const errorMessages = buildErrorMessages(detail.path, {
      message: detail.message
    })

    return {
      ...errorMessages,
      ...errors
    }
  }, {})
}

export { buildErrorDetails }
