import { type ConfigAPI, type PluginObj, types as t } from "@babel/core";

export default function (api: ConfigAPI): PluginObj {
	return {
		visitor: {
			Statement(path) {
				if (path.node.trailingComments) {
					switch (path.node.trailingComments[0]!.value) {
						case '?':
							path.insertBefore(
								t.callExpression(
									t.identifier('console.log'),
									[t.stringLiteral(JSON.stringify(path.node.expression!))]
								)
							);
							break;
						default:
							break;
					}
				}
			},
			CallExpression(path) {
				if (path.node.callee.name! === 'print') {
					path.replaceWith(t.callExpression(t.identifier('console.log'), path.node.arguments));
				}
			}
		}
	};
}
