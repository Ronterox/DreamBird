import { type PluginObj, types as t } from "@babel/core";

const constants: Record<string, t.Expression> = {};

function presentInformation(exp: t.Expression): string {
	let result = "";
	switch (exp.type) {
		case "StringLiteral":
			result = `"${exp.value}"`;
			break;
		case "NumericLiteral":
			result = exp.value + "";
			break;
		case "Identifier":
			result = exp.name;
			break;
		case "CallExpression":
			result = `${exp.callee.name}(${exp.arguments.map(arg => presentInformation(arg)).join(", ")})`;
			break;
		default:
			result = exp.type;
			break;
	}
	return result;
}

export default function (): PluginObj {
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
										[t.stringLiteral(presentInformation(path.node.expression!))]
									)
								);
								break;
							case "const":
								for (const d of path.node.declarations) {
									d.init = t.callExpression(t.identifier('Object.freeze'), [d.init!]);
								}
								break
							case "constant":
								for (const d of path.node.declarations) {
									constants[d.id.name] = t.callExpression(t.identifier('Object.freeze'), [d.init!]);
								}
								path.remove();
								break
						}
					}
				}
			},
			AssignmentExpression(path) {
				if (path.node.left.type === "MemberExpression") {
					const property = path.node.left.property;
					if (property.type === "NumericLiteral" && (property.value + "").includes(".")) {
						const arrname = path.node.left.object.name!;
						path.replaceWith(
							t.callExpression(
								t.identifier(`${arrname}.splice`),
								[t.numericLiteral(Math.round(property.value + 1)), t.numericLiteral(0), path.node.right]
							)
						);
						return;
					}
				}
			},
			Identifier(path) {
				if (constants[path.node.name]) {
					path.replaceWith(constants[path.node.name]!);
				}
			},
			MemberExpression(path) {
				const property = path.node.property;
				if (property.type === "NumericLiteral" || property.type === "UnaryExpression") {
					path.node.property = t.binaryExpression('+', property, t.numericLiteral(1));
				}
			},
			StringLiteral(path) {
				if (path.node.value.length > 1) {
					path.replaceWith(t.arrayExpression(path.node.value.split("").map(char => t.stringLiteral(char))));
				}
			},
			NumberLiteral(path) {
				const numval = path.node.value;
				if ((numval + "").includes(".")) return;
				if (numval > 9 || numval < -9) {
					path.replaceWith(t.arrayExpression((numval + "").split("").map(num => t.numericLiteral(+num))));
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
