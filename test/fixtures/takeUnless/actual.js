(() => {
  const result = {}

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  obj
    .takeUnless(it === undefined)
    .takeUnless((obj) => {
      result[0] = obj.p
      return obj.f(5) !== false
    })
    .takeUnless(result[1] = it)

  return result
})()