"use strict";

/**
 * RegexParser
 * Parses a string input.
 *
 * @author https://www.npmjs.com/package/match-all
 *
 * @author https://www.npmjs.com/package/regex-parser
 *
 * @name RegexParser
 * @function
 * @param {String} input The string input that should be parsed as regular
 * expression.
 * @return {RegExp} The parsed regular expression.
 */
var RegexParser = function (input) {

  // Validate input
  if (typeof input !== "string") {
    throw new Error("Invalid input. Input must be a string");
  }

  // Parse input
  var m = input.match(/(\/?)(.+)\1([a-z]*)/i);

  // Invalid flags
  if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
    return RegExp(input);
  }

  // Create the regular expression
  return new RegExp(m[2], m[3]);
};

/**
 * matchAll
 * Get all the matches for a regular expression in a string.
 *
 * @name matchAll
 * @function
 * @param {String} s The input string.
 * @param {RegExp} r The regular expression.
 * @return {Object} An object containing the following fields:
 *
 *  - `input` (String): The input string.
 *  - `regex` (RegExp): The regular expression.
 *  - `next` (Function): Get the next match.
 *  - `toArray` (Function): Get all the matches.
 *  - `reset` (Function): Reset the index.
 */
var matchAll = function(s, r) {
  return {
    input: s
    , regex: r

    /**
     * next
     * Get the next match in single group match.
     *
     * @name next
     * @function
     * @return {String|null} The matched snippet.
     */
    , next () {
      let c = this.nextRaw()
      if (c) {
        for (let i = 1; i < c.length; i++) {
          if (c[i]) {
            return c[i]
          }
        }
      }
      return null
    }

    /**
     * nextRaw
     * Get the next match in raw regex output. Usefull to get another group match.
     *
     * @name nextRaw
     * @function
     * @returns {Array|null} The matched snippet
     */
    , nextRaw () {
      let c = this.regex.exec(this.input)
      return c
    }

    /**
     * toArray
     * Get all the matches.
     *
     * @name toArray
     * @function
     * @return {Array} The matched snippets.
     */
    , toArray () {
      let res = []
        , c = null


      while (c = this.next()) {
        res.push(c)
      }

      return res
    }

    /**
     * reset
     * Reset the index.
     *
     * @name reset
     * @function
     * @param {Number} i The new index (default: `0`).
     * @return {Number} The new index.
     */
    , reset (i) {
      return this.regex.lastIndex = i || 0
    }
  }
};

module.exports = function (parsed, when, value) {
  const { type, header } = parsed;

  if (!value) {
    return [true]
  }

  const projectNameType = typeof value.projectName;

  if (projectNameType !== 'string') {
    return [false, `ProjectName must be a string. Actual type: ${projectNameType}`]
  }

  const JIRA_PROJECT_NAME = value.projectName;

  if (typeof JIRA_PROJECT_NAME !== 'string') {
    return [true];
  }


  const isChore = type === 'chore';

  const jiraRegex = '/' + JIRA_PROJECT_NAME + '/g'
  const formattedJiraRegex = '\/' + '\\s\\(' + JIRA_PROJECT_NAME + '-(\\d+)\\)\\W/g';

  const globalJiraRegex = RegexParser(jiraRegex);
  const resultJiraMatches = Array.from(matchAll(header, globalJiraRegex));
  const hasDoubledTaskName = resultJiraMatches.length > 1;

  if (resultJiraMatches.length === 0 && !isChore) {
    return [
      false,
      `Commit must contains Jira task identifier. Example: (${JIRA_PROJECT_NAME}-777)`
    ]
  }

  if (hasDoubledTaskName) {
    return [
      false,
      `Commit must contains Jira only one task identifier.`
    ]
  }

  const formattedRegex = RegexParser(formattedJiraRegex);
  const hasValidTaskName = formattedRegex.test(header);

  if (!hasValidTaskName && !isChore) {
    return [
      false,
      `Commit must contains Jira task identifier. Example: (${JIRA_PROJECT_NAME}-777)`
    ]
  }

  return [
    true
  ]
};
