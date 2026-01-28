import { type ConfigAPI, NodePath, type PluginObj, types as t } from "@babel/core";

export default function (api: ConfigAPI): PluginObj {
	return {
		visitor: {
			Statement(path) {
				if (path.node.trailingComments) {
					const comment = path.node.trailingComments[0]!.value.trim();
					for (const att of comment.split("//")) {
						switch (att.trim()) {
							case '?':
								path.insertBefore(
									t.callExpression(
										t.identifier('console.log'),
										[t.stringLiteral(JSON.stringify(path.node.expression!, null, 1))]
									)
								);
								break;
							case "const":
								const dec = path as NodePath<t.VariableDeclaration>;
								for (const d of dec.node.declarations) {
									d.init = t.callExpression(t.identifier('Object.freeze'), [d.init!]);
								}
								break
						}
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
