/**
 *
 * any question or idea, email to i@closx.com
 * @author HerbLuo
 * @date 2017/10/5
 * @license Licensed under the MIT license.
 *
 * change logs:
 * 2017/10/5 herbluo created
 */
const fs = require('fs')
const babel = require('babel-core')
const kotlish = require('../src/index');

const fileName = process.argv[2];

fs.readFile(fileName, function(err, data) {
  if(err) throw err;

  const src = data.toString();

  const out = babel.transform(src, {
    plugins: [kotlish]
  });

  console.log(out.code);
});
