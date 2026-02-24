/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {Object} err - error object
 */
export const handleError = (res = {}, err = {}) => {

  // if (process.env.NODE_ENV === 'development') {
  //   // eslint-disable-next-line no-console
  //   console.log(err)
  // }
  // eslint-disable-next-line no-console
  console.log(err)


  if (res.headersSent) return;
  res.status(err?.code || 404).json({ errors: err })
  }

export default handleError
