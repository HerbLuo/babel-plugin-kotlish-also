(() => {
  const result = {}

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  obj
    .p
    .to(result[0])
    .substring(3)
    .to(result[1])

  return result
})()