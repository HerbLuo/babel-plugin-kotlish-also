(() => {
  const result = {}

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  obj
    .takeIf(it !== undefined)
    .takeIf((obj) => {
      result[0] = obj.p
      return obj.f(5) === false
    })
    .takeIf(result[1] = it)

  return result
})()