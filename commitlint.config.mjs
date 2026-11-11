/* eslint-disable import/no-extraneous-dependencies */
import { maxLineLength } from '@commitlint/ensure'

const bodyMaxLineLength = 100

const validateBodyMaxLengthIgnoringDeps = (parsedCommit) => {
  const { type, scope, body } = parsedCommit
  const isDepsCommit =
    type === 'chore' && (scope === 'deps' || scope === 'deps-dev')

  return [
    isDepsCommit || !body || maxLineLength(body, bodyMaxLineLength),
    `body's lines must not be longer than ${bodyMaxLineLength}`,
  ]
}

// A GitHub App's noreply address alone makes its co-author trailer too long.
const validateFooterMaxLengthIgnoringCoAuthors = (parsedCommit) => {
  const footer = (parsedCommit.footer ?? '')
    .split('\n')
    .filter((line) => !/^co-authored-by:/i.test(line))
    .join('\n')

  return [
    !footer || maxLineLength(footer, bodyMaxLineLength),
    `footer's lines must not be longer than ${bodyMaxLineLength}`,
  ]
}

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'body-max-line-length': [0],
    'function-rules/body-max-line-length': [
      2,
      'always',
      validateBodyMaxLengthIgnoringDeps,
    ],
    'footer-max-line-length': [0],
    'function-rules/footer-max-line-length': [
      2,
      'always',
      validateFooterMaxLengthIgnoringCoAuthors,
    ],
  },
}
