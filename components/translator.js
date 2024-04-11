const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const americanToBritish = { ...americanOnly, ...americanToBritishSpelling };

const reversed = (obj) => {
    return Object.keys(obj).reduce((newObj, key) => {
        return Object.assign({}, newObj, { [obj[key]]: key });
    }, {});
}
const britishToAmericanSpelling = reversed(americanToBritishSpelling);

const britishToAmerican = { ...britishOnly, ...britishToAmericanSpelling }

const translator = (text, locale) => {

    const lowerCasedText = text.toLowerCase();
    const dict = locale == "american-to-british" ? americanToBritish : britishToAmerican
    const titlesDict = locale == "american-to-british" ? americanToBritishTitles : reversed(americanToBritishTitles)
    const timeRegex =
        locale === "american-to-british"
            ? /([1-9]|1[012]):[0-5][0-9]/g
            : /([1-9]|1[012]).[0-5][0-9]/g;
    const match = {};

    // Matching titles
    Object.entries(titlesDict).map(([k, v]) => {
        if (lowerCasedText.split(' ').includes(k)) {
            let spl = v.split('')
            spl[0] = spl[0].toUpperCase()
            match[k] = spl.join('');
        }
    });

    // Matching open compound words (having spaces)
    const openCompWords = Object.fromEntries(Object.entries(dict).filter(([k, v]) => k.includes(" ")));
    Object.entries(openCompWords).map(([k, v]) => {
        if (lowerCasedText.includes(k)) {
            match[k] = v;
        }
    });

    // Matching other words
    lowerCasedText.match(/\w+(?:[-'\w]+)*/gm).map((word) => {
        if (dict[word]) return (match[word] = dict[word]);
    });

    // Matching times
    const matchedTime = lowerCasedText.match(timeRegex);

    if (matchedTime) {
        matchedTime.map((e) => {
            if (locale === "american-to-british") {
                return (match[e] = e.replace(":", "."));
            }
            return (match[e] = e.replace(".", ":"));
        });
    }

    // No matching
    if (Object.keys(match).length === 0) return null;

    const replaced = replace(text, match);
    const highlighted = highlight(text, match);

    return [replaced, highlighted];

}

const replace = (text, match) => {
    const re = new RegExp(Object.keys(match).join("|"), "gi");
    return text.replace(re, (matching) => match[matching.toLowerCase()]);
}

const highlight = (text, match) => {
    const re = new RegExp(Object.keys(match).join("|"), "gi");

    return text.replace(re, (matched) => {
        return `<span class="highlight">${match[matched.toLowerCase()]}</span>`;
    });
}

module.exports = translator;