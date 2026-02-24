import { matchedData } from 'express-validator'
import saveUserAccessAndReturnToken from './helpers/saveUserAccessAndReturnToken'
import findUser from './helpers/findUser'
import { handleError, buildErrObject } from '../../../middlewares/utils'
import { checkPassword } from '../../../middlewares/auth'
import reCAPTCHA from './helpers/reCAPTCHA'

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
export const login_controller = async (req, res) => {
  try {
    const data = matchedData(req)
    const node_env = process.env?.NODE_ENV || 'development'
    if (node_env == 'production') {
      if (!data?.captchaToken) {
        throw buildErrObject(422, 'AUTH.LOGIN.CAPTCHA_REQUIRED', 'captchaToken variable is required.')
      }
      await reCAPTCHA(data.captchaToken)
    }

    const user = await findUser(data.email)

    if (user == null) {
      throw buildErrObject(422, 'AUTH.ACCOUNT_NOT_FOUND', 'Account does not exist.')
    }
    const isPasswordMatch = await checkPassword(data.password, user)
  console.log(isPasswordMatch)
    if (!isPasswordMatch) {
      throw buildErrObject(409, 'AUTH.INVALID_PASSWORD', 'Password is incorrect.')
    }

    if (!user?.verified) {
      throw buildErrObject(422, 'AUTH.EMAIL_NOT_VERIFIED', 'The account has not been email verified.')
    }

    return res.status(200).json(await saveUserAccessAndReturnToken(req, user))

  } catch (error) {
    handleError(res, error)
  }
}

export default login_controller
