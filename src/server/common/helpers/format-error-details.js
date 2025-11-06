/**
 * Converts error details object (from buildErrorDetails) to a comma-separated string
 * @param {Object} errorDetails - Object with error details keyed by field name
 * @returns {string} Comma-separated error messages
 */
function formatErrorDetailsAsString(errorDetails) {
  return Object.values(errorDetails)
    .map((detail) => detail.message)
    .join(', ')
}

export { formatErrorDetailsAsString }
