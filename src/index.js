const IT = 'it'

module.exports = function ({types}) {
  return {
    visitor: {
      CallExpression (path) {
        const callee = path.node.callee
        const obj = callee.object

        if (types.isMemberExpression(callee)) {
          const methodName = callee.property.name

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
              'takeUnless' // ok
            ].includes(methodName)) {
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

            // 参数 （用户传入的）
            const arg0 = path.node.arguments[0]

            /*
             * 用户定义的方法体 ，如 print
             * 如存在 it，重新包装成方法
             */
            const block = hasIt(path.get('arguments.0'))
              ? types.FunctionExpression(
                null,
                [types.Identifier(IT)],
                types.BlockStatement([
                  types.ReturnStatement(arg0)
                ])
              )
              : arg0

            // argT as the block's receiver(argument)
            const argT = types.Identifier('_o')

            // new function replace to
            const newFunc = types.FunctionExpression(
              null, // no name
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
