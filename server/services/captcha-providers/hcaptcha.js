'use strict'
const axios = require('axios')

const invertScore = (score) => {
  return (1 - score).toFixed(2)
}

module.exports = ({strapi}) => ({
  async validate(token) {
    if (!token) {
      strapi.log.error('Missing hCaptcha Token')
      return {
        valid: false,
        message: 'Missing token',
        code: 400
      }
    }
    const secret_key = strapi.config.get('plugin.ezforms.captchaProvider.config.secretKey')
    const url = `https://api.hcaptcha.com/siteverify?secret=${secret_key}&response=${token}`
    let hcaptcha_verify
    try {
      hcaptcha_verify = await axios.post(url)
    } catch (e) {
      strapi.log.error(e)
      return {

        valid: false,
        message: 'Unable to verify captcha',
        code: 500

      }
    }

    if (!hcaptcha_verify.data.success) {
      strapi.log.error('hcaptcha_verify')
      strapi.log.error(hcaptcha_verify)
      return {
        valid: false,
        message: 'Unable to verify captcha',
        code: 500
      }
    }
    
    const hcaptcha_score = invertScore(hcaptcha_verify.data.score)

    if (hcaptcha_score < strapi.config.get('plugin.ezforms.captchaProvider.config.score')) {
      return {

        valid: false,
        message: 'Score Not High Enough',
        code: 400

      }
    }
    return {
      score: hcaptcha_score,
      valid: true
    }
  },
})

