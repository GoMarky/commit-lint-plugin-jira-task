const RegexParser = require('regex-parser');

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
  const resultJiraMatches = Array.from(header.matchAll(globalJiraRegex));
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
