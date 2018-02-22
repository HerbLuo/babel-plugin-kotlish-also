(() => {
  const result = {}

  const obj = {
    p: 'property',
    f(a) {
      return a + 1
    },
    _ok: 'ok',
    h(a) {
      return a + ' ' + this._ok
    }
  }

  obj
    .let(it)
    .let((obj) => {
      result[0] = obj.p
      return obj.f(5)
    })
    .let(result[1] = it)
    .let(::obj.h)
    .let(result[2] = it)

  return result
})()