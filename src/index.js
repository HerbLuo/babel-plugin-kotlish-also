const IT = 'it'

/**
 * 是否存在it （Identifier）
 */
const hasIt = (path) => {
  let areITFound = false
  if (path.node.name === IT) {
    return true
  }
  path.traverse({
    Identifier (path) {
      if (path.node.name === IT) {
        areITFound = true
      }
    }
  })
  return areITFound
}

module.exports = function ({types}) {
  const consoleLog = (args) => types.CallExpression(
    types.MemberExpression( // console.log
      types.Identifier('console'),
      types.Identifier('log')
    ),
    args
  )

  const promiseThen = (promise, thenFunc) => types.CallExpression(
    types.MemberExpression(
      promise,
      types.Identifier('then')
    ),
    [thenFunc]
  )

  return {
    visitor: {
      CallExpression (path) {
        const callee = path.node.callee
        const obj = callee.object

        if (types.isMemberExpression(callee)) {
          const methodName = callee.property.name

          // 创建新的方法体 例 调用print，返回相应值
          const getFunctionBody = (methodName, block, argT) => {
            const blockCall = types.CallExpression(block, [argT])

            if (methodName === 'let') {
              return [types.ReturnStatement(blockCall)] // return block(argT)
            }

            if (['takeIf', 'takeUnless'].includes(methodName)) {
              const isTakeIf = methodName === 'takeIf'
              return [
                types.ReturnStatement(
                  types.ConditionalExpression(
                    isTakeIf
                      ? blockCall
                      : types.UnaryExpression('!', blockCall), // condition
                    argT,
                    types.NullLiteral()
                  )
                )
              ]
            }

            return [ // ...
              types.ExpressionStatement(blockCall), // block(argT)
              types.ReturnStatement(argT) // return argT
            ]
          }

          /*
           * 针对 let, also, 等方法 进行改写
           * 1 T.[methodName](block: (T) => any): T
           *
           * 注释以 obj.also(print).obj_property 为参考
           */
          if (
            ['let', // ok
              'also', // ok
              'takeIf', // ok
              'takeUnless', // ok
              'alsoPrint', // ok
              'alsoThen'
            ].includes(methodName)) {
            // 参数 （用户传入的）
            const arg0 = path.node.arguments[0]

            // function (_i) { console.log(_i) }
            const printFunctionExpression = types.ArrowFunctionExpression(
              [types.Identifier('_i')],
              types.BlockStatement([
                types.ExpressionStatement(
                  consoleLog(arg0 ? [arg0, types.Identifier('_i')]
                    : [types.Identifier('_i')])
                )
              ])
            )

            // function (it) { return !arg0! }
            const withItFunctionExpression = types.ArrowFunctionExpression(
              [types.Identifier(IT)],
              types.BlockStatement([
                types.ReturnStatement(arg0)
              ])
            )

            /*
             * 用户定义的方法体 ，如 print
             * 如存在 it，重新包装成方法
             */
            let block
            if (methodName === 'alsoPrint') {
              block = printFunctionExpression
            } else if (methodName === 'alsoThen') {
              block = types.ArrowFunctionExpression(
                [types.Identifier('_p')],
                types.BlockStatement([
                  types.ExpressionStatement(
                    promiseThen(types.Identifier('_p'), arg0)
                  )
                ])
              )
            } else if (hasIt(path.get('arguments.0'))) {
              block = withItFunctionExpression
            } else {
              block = arg0
            }

            // argT as the block's receiver(argument)
            const argT = types.Identifier('_o')

            // new function replace to
            const newFunc = types.ArrowFunctionExpression(
              [argT], // arguments (o)
              types.BlockStatement(getFunctionBody(methodName, block, argT))
            )

            path.replaceWith(
              types.CallExpression(
                newFunc, [obj]) // (new function)(obj)
            )
          }

          /*
           * to
           * obj.to(v) <=> (v = obj)
           */
          if (methodName === 'to') {
            const arg0 = path.node.arguments[0]
            path.replaceWith(types.AssignmentExpression('=', arg0, obj))
          }
        }
      }
    }
  }
}
