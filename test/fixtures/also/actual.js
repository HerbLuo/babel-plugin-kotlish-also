(() => {
  const result = {}

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  obj
    .also(it.p)
    .also((obj) => {
      result[0] = obj.p
      return obj.f(5)
    })
    .also(result[1] = it.f(1))

  return result
})()