'use strict';

var IT = 'it';

module.exports = function (_ref) {
  var types = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path) {
        var callee = path.node.callee;
        var obj = callee.object;

        if (types.isMemberExpression(callee)) {
          var methodName = callee.property.name;

          // 创建新的方法体 例 调用print，返回相应值
          var getFunctionBody = function getFunctionBody(methodName, block, argT) {
            var blockCall = types.CallExpression(block, [argT]);

            if (methodName === 'let') {
              return [types.ReturnStatement(blockCall)]; // return block(argT)
            }

            if (['takeIf', 'takeUnless'].includes(methodName)) {
              var isTakeIf = methodName === 'takeIf';
              return [types.ReturnStatement(types.ConditionalExpression(isTakeIf ? blockCall : types.UnaryExpression('!', blockCall), // condition
              argT, types.NullLiteral()))];
            }

            return [// ...
            types.ExpressionStatement(blockCall), // block(argT)
            types.ReturnStatement(argT) // return argT
            ];
          };

          /**
           * 是否存在it （Identifier）
           */
          var hasIt = function hasIt(path) {
            var areITFound = false;
            if (path.node.name === IT) {
              return true;
            }
            path.traverse({
              Identifier: function Identifier(path) {
                if (path.node.name === IT) {
                  areITFound = true;
                }
              }
            });
            return areITFound;
          };

          /*
           * 针对 let, also, 等方法 进行改写
           * 1 T.[methodName](block: (T) => any): T
           *
           * 注释以 obj.also(print).obj_property 为参考
           */
          if (['let', // ok
          'also', // ok
          'takeIf', // ok
          'takeUnless', // ok
          'alsoPrint'].includes(methodName)) {
            // 参数 （用户传入的）
            var arg0 = path.node.arguments[0];

            // function (_i) { console.log(_i) }
            var printFunctionExpression = types.ArrowFunctionExpression([types.Identifier('_i')], types.BlockStatement([types.ExpressionStatement(types.CallExpression(types.MemberExpression( // console.log
            types.Identifier('console'), types.Identifier('log')), arg0 ? [arg0, types.Identifier('_i')] : [types.Identifier('_i')]))]));

            // function (it) { return !arg0! }
            var withItFunctionExpression = types.ArrowFunctionExpression([types.Identifier(IT)], types.BlockStatement([types.ReturnStatement(arg0)]));

            /*
             * 用户定义的方法体 ，如 print
             * 如存在 it，重新包装成方法
             */
            var block = void 0;
            if (methodName === 'alsoPrint') {
              block = printFunctionExpression;
            } else if (hasIt(path.get('arguments.0'))) {
              block = withItFunctionExpression;
            } else {
              block = arg0;
            }

            // argT as the block's receiver(argument)
            var argT = types.Identifier('_o');

            // new function replace to
            var newFunc = types.ArrowFunctionExpression([argT], // arguments (o)
            types.BlockStatement(getFunctionBody(methodName, block, argT)));

            path.replaceWith(types.CallExpression(newFunc, [obj]) // (new function)(obj)
            );
          }

          /*
           * to
           * obj.to(v) <=> (v = obj)
           */
          if (methodName === 'to') {
            var _arg = path.node.arguments[0];
            path.replaceWith(types.AssignmentExpression('=', _arg, obj));
          }
        }
      }
    }
  };
};