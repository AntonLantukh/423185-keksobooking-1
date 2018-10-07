'use strict';

const readline = require(`readline`);
const fs = require(`fs`);

const generate = require(`./generator/generate`);
const defaultMessage = require(`./default`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let regime = `Approve not granted`;
let data = {
  count: 0,
  path: ``
};

const createFile = () => {
  generate.execute(data.path, data.count).then(() => {
    rl.setPrompt(`Элементы созданы!\n`);
    rl.prompt();
    rl.close();
    process.exit(0);
  });
};

const getApprove = (cmd) => {
  if (cmd.trim() === `y`) {
    regime = `Approve granted`;
    rl.setPrompt(`Cколько элементов нужно создать?\n`);
    rl.prompt();
  } else if (cmd.trim() === `n`) {
    rl.close();
    process.exit(0);
  } else {
    rl.setPrompt(`Неверная команда\n`);
    rl.prompt();
  }
};

const setupGeneration = (cmd) => {
  if (parseInt(cmd, 10) && cmd >= 1 && cmd <= 20) {
    regime = `Path setup`;
    data.count = parseInt(cmd, 10);
    rl.setPrompt(`Пожалуйста, укажите путь для сохранения данных\n`);
    rl.prompt();
  } else if (!parseInt(cmd.trim(), 10)) {
    rl.setPrompt(`Нужно указать число\n`);
    rl.prompt();
  } else {
    rl.setPrompt(`Число не должно быть меньше 1 и больше 20\n`);
    rl.prompt();
  }
};

const checkPath = (cmd) => {
  fs.readdir(cmd, (err, files) => {
    if (err) {
      rl.setPrompt(`Нужно указать корректный путь\n`);
      rl.prompt();
    } else {
      const fileExists = files.find((item) => item === `generatedData.json`);
      if (!fileExists) {
        data.path = cmd;
        createFile();
      } else {
        regime = `File rewrite`;
        rl.setPrompt(`Файл уже существует. Перезаписать?\n`);
        rl.prompt();
      }
    }
  });
};

const fileRewrite = (cmd) => {
  if (cmd.trim() === `y`) {
    createFile();
  } else if (cmd.trim() === `n`) {
    rl.close();
    process.exit(0);
  } else {
    rl.setPrompt(`Неверная команда\n`);
    rl.prompt();
  }
};

const createConsoleInterface = () => {
  rl.setPrompt(defaultMessage.execute());
  rl.prompt();
  rl.on(`line`, (command) => {
    switch (regime) {
      case `Approve not granted`:
        getApprove(command);
        break;
      case `Approve granted`:
        setupGeneration(command);
        break;
      case `Path setup`:
        checkPath(command);
        break;
      case `File rewrite`:
        fileRewrite(command);
        break;
    }
  });
};

module.exports = createConsoleInterface;
