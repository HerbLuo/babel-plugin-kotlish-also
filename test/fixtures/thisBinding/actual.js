(function () {
  const result = {}

  const obj = this

  obj
    .also(it.p)
    .also((obj) => {
      result[0] = obj.p
      return obj.f(5)
    })
    .also(result[1] = it.f(1))
    .also(() => {
      result[2] = this.p
    })
    .also(result[3] = it.f(this.p))

  return result
}).call({
  p: 'property',
  f: function (a) {
    return a + 1
  }
})