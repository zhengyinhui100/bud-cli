/**!
 * 初始化项目模板
 *
 * Copyright(c) Alibaba Group Holding Limited.
 *
 */

'use strict';

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const replace = require("replace");
const beautify = require('js-beautify').js;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let questions = [
  ['type','请输入项目类型(art、antd，默认是art):'],
  ['name','请输入项目名称:'],
  ['description','请输入项目描述:'],
  ['uae2AppId','请输入uae2的appid:'],
  ['uae2AppName','请输入uae2的项目名称:'],
  ['uaeAppId','请输入uae的appid:'],
  ['uaeAppName','请输入uae的项目名称:'],
  ['gopAppId','请输入gop的appid:'],
  ['gopAppName','请输入gop的项目名称:']
];
let answers={};


exports.init = function() {
  getParams();
};

function getParams(){
    let q = questions.shift();
    rl.question(q[1], (answer) => {
      if(q[0] === 'type'){
        if( answer && answer != 'art' && answer != 'antd'){
          console.error('\n目前只支持art和antd模板！\n');
          process.exit();
          return;
        }
      }
      answers[q[0]] = answer;
      if(questions.length>0){
        getParams();
      }else{
        rl.close();
        createProject();
      }
    });
}

function createProject(){

  let type = answers.type;
  if(type == 'art'){
    type = '';
  }
  const names = [
      'bud-sample' + ( type ? '-' + type : '' ),
      'budsample' + ( type ? type : '' ),
      'bud_sample' + ( type ? '_' + type : '' )
  ]

  exec('git clone git@gitlab.alibaba-inc.com:pp-bud/' + names[0] + '.git bud-tmp');
  exec('rm -rf bud-tmp/.git');
  exec('mv  bud-tmp/*  bud-tmp/.[^.]*  .');
  exec('rm -rf bud-tmp');

  let budConfPath=path.resolve('bud.config.js');
  let budConf = require(budConfPath);

  let publish = budConf.publish = {};

  if( answers.uaeAppName || answers.uaeAppId){
      publish.uae = {
        name: answers.uaeAppName,
        id : answers.uaeAppId
      }
  }
  if( answers.uae2AppName || answers.uae2AppId){
      publish.uae2 = {
          name: answers.uae2AppName,
          id : answers.uae2AppId
      }
  }
  if( answers.gopAppName || answers.gopAppId){
      publish.gop = {
          name: answers.gopAppName,
          id : answers.gopAppId
      }
  }

  let budConfStr = 'module.exports = ' + JSON.stringify(budConf) + ';';
  budConfStr = beautify(budConfStr, { indent_size: 2, space_in_empty_paren: true });
  // budConfStr = budConfStr.replace('name:\'' + names[1] + '','name:\'' +answers.uaeAppName).replace('id:3392','id:' + (answers.uaeAppId || 0)).replace('name:\'' + names[2], 'name:\'' + answers.gopAppName).replace('id:4735','id:' + (answers.gopAppId || 0));
  fs.writeFileSync(budConfPath, budConfStr);

  let pkgJsonPath=path.resolve('package.json');
  let pkgJson = require(pkgJsonPath);
  pkgJson.name=answers.name;
  pkgJson.version='0.1.0';
  pkgJson.description=answers.description;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson,null, 2));

  let configDir=path.resolve('config');
  replace({
    regex: names[0],
    replacement: answers.name,
    paths: [configDir],
    recursive: true,
    silent: true
  });
  replace({
    regex: names[2],
    replacement: answers.name.replace('-','_'),
    paths: [configDir],
    recursive: true,
    silent: true
  });
  replace({
    regex: names[1],
    replacement: answers.uaeAppName.replace('-',''),
    paths: [configDir],
    recursive: true,
    silent: true
  });

  console.log("create success!!")
}
