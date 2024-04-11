'use strict';

const translator = require('../components/translator.js');

module.exports = function (app) {

  app.route('/api/translate')
    .post((req, res) => {
      let { text, locale } = req.body;

      // Required field(s) missing
      if ((text == undefined || !locale)) return res.json({ error: 'Required field(s) missing' })

      // No text to translate
      if (text == "") return res.json({ error: 'No text to translate' })

      if (locale == "american-to-british" || locale == "british-to-american") {
        let translation = translator(text, locale);
        if (translation) {
          if (text == translation[0]) return res.json({ text: text, translation: 'Everything looks good to me!' })
          else return res.json({ text: text, translation: translation[1] })
        } else {
          return res.json({ text: text, translation: 'Everything looks good to me!' })
        }
      } else {
        return res.json({ error: 'Invalid value for locale field' })
      }
    });
};
