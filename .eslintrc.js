module.exports = {
    parserOptions: {
        ecmaVersion: 8,
        "sourceType": "module",
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
    },
    "plugins": [
    ],
    "extends": [
        "eslint:recommended",
    ],
    "env": {
        "browser": true,
        "node": true,
        "jest": true,
        "commonjs": true,
        "es6": true,
    },
    "settings": {

        "propWrapperFunctions": [
            // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
            "forbidExtraProps",
            // {"property": "freeze", "object": "Object"},
            // {"property": "myFavoriteWrapper"}
        ],
    },
    "rules": {
        "no-unused-vars": 0,
        "no-useless-escape": 0,
        "no-extra-semi": 1,
        "no-var": 2,
    },

};

