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
const obj = {
  p: 'property',
  f: function (a) {
    return a + 1
  }
}

const print = console.log.bind(console)

obj.f()

obj.let(it)

obj
  .also(console.log(it.p))
  .f(2)
  .also(print)

obj
  .let((o) => o.p)
  .also(print)

obj
  .takeIf(o => o.p === 'property')
  .also(print)
  .takeIf(o => o.x)
  .also(print)

obj
  .takeUnless(o => o.p !== null)
  .also(print)

obj
  .alsoPrint()
  .alsoPrint('obj为')
  .also(print)

function foo(o) {
  return o.also(console.log(it))
    .a().also(console.log(it))
    .b.c
}

Promise.resolve(1)
  .alsoThen(m => console.log(m))
  .then(console.log)
