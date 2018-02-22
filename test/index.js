/**
 * copied from https://github.com/chikara-chan/babel-plugin-react-scope-binding/blob/master/test/index.js
 * modified by herbluo
 */
import test from 'ava'
import { promisify } from 'bluebird'
import { readdirSync, readFile } from 'fs'
import path from 'path'
import { transformFile } from 'babel-core'
import plugin from '../src'

const dirnames = readdirSync(path.resolve(__dirname, 'fixtures'))

const removeCrlf = (str) => {
  return str.replace(/[\n\r]/g, '')
}

const geval = eval

dirnames.forEach(dirname => {
  test(dirname, async t => {
    const [{code}, expectedCode, resultStr] = await Promise.all([
      promisify(transformFile)(
        path.resolve(__dirname, `fixtures/${dirname}/actual.js`),
        {
          presets: ['es2015'],
          plugins: [plugin]
        }
      ),
      promisify(readFile)(
        path.resolve(__dirname, `fixtures/${dirname}/expected.js`),
        'utf-8'
      ).catch(e => ''),
      promisify(readFile)(
        path.resolve(__dirname, `fixtures/${dirname}/result.json`),
        'utf-8'
      )
    ])

    if (expectedCode) {
      t.is(removeCrlf(code), removeCrlf(expectedCode))
      return
    }

    const expectedResult = resultStr && JSON.parse(resultStr)
    if (expectedResult) {
      let result
      try {
        result = geval(code)
      } catch (e) {
        console.log(e)
      }

      t.deepEqual(result, expectedResult, code)
      return
    }

    t.fail()
  })
})
