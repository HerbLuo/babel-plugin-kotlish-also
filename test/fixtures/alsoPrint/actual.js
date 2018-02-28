(() => {
  const result = {}

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  global.console.log = function (data) {
    result[0] = data
  }

  obj
    .p
    .alsoPrint()

  return result
})()