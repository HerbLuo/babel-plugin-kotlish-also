(() => {
  const result = []

  const obj = {
    p: 'property',
    f: function (a) {
      return a + 1
    }
  }

  global.console.log = function (data, args) {
    data && result.push(data)
    args && result.push(args)
  }

  obj
    .p
    .alsoPrint()
    .alsoPrint('测试')

  return result
})()