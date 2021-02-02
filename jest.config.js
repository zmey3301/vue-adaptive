/**************************************************************************************************
 * Copyright © 2017-2021 Mikhail Perelygin <mk.prlgn@gmail.com>.                                  *
 * Huge thanks to:                                                                                *
 *     Sergey Koshevarov <gondragos@gmail.com> for plugin idea;                                   *
 *     Maxim Logvinov <skovorodker.rekdo@gmail.com> for optimisation ideas;                       *
 * Program is distributed under the terms of the MIT License.                                     *
 *                                                                                                *
 * @date        2.2.2021                                                                          *
 * @license     MIT                                                                               *
 **************************************************************************************************/

module.exports = {
  setupFilesAfterEnv: ["jest-extended"],
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest",
    ".+\\.(js)$": "<rootDir>/node_modules/babel-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: ["**/src/**/*.js", "!**/node_modules/**"]
}
