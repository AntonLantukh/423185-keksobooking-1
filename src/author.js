'use strict';

const colors = require(`colors`);
const packageInfo = require(`../package.json`);

module.exports = {
  name: `author`,
  description: `печатает автора приложения`,
  execute() {
    console.log(colors.yellow(packageInfo.author));
  }
};
