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
  const formattedJiraRegex = '\/' + '\\s\\(' + JIRA_PROJECT_NAME + '-(\\d+)\\)\\W/g';

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
