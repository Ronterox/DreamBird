import { transformFileSync } from "@babel/core";
import plugin from "./plugin.ts";
import Bun from "bun";

if (Bun.argv.length < 3) {
	console.log("Usage: bun run index.ts -- test.db");
	process.exit(1);
}

const filepath = Bun.argv[2] as string;
const variables: Record<string, number> = {};

function includesVariable(line: string): string | undefined {
	for (const key of Object.keys(variables)) {
		if (line.includes(key)) {
			return key;
		}
	}
	return undefined;
}

const content = (await Bun.file(filepath).text()).split("\n").reduce((acc, line) => {
	if (line.match(/^\s*(const|var).*=.*/)) {
		const [identifier, expression] = line.split("=");
		const left = identifier!.trim().split(" ");
		const varname = left[left.length - 1]!;

		if (variables[varname] !== undefined) {
			left[left.length - 1] = varname + ++variables[varname];
			acc.push(left.join(" ") + "=" + expression);
		} else {
			variables[varname] = 0;
			acc.push(line);
		}
		return acc;
	}

	const ident = includesVariable(line);
	if (ident) line = line.replaceAll(ident, ident + (variables[ident] || ""));

	acc.push(line);
	return acc;
}, [] as string[])
	.join("\n")
	.replaceAll(";", "!")
	.replace(/([!?]+)\s*(\/\/.*)?$/gm, "; // $1")
	.replace(/const\s*var/gm, "const")
	.replace(/var\s*const\s*(.*)/gm, "let $1 // const")
	.replace(/var\s*var/gm, "let")
	.replace(/const\s*const\s*const\s*(.*)/gm, "const $1 // constant")
	.replace(/const\s*const\s*(.*)/gm, "const $1 // const")
	.replace(/=>\s*{/gm, "{")

// console.log(content);
// process.exit(1);

const numbers = await Bun.file("numbers.js").text();
const builtins = await Bun.file("builtins.js").text();

const filejs = filepath.split(".", 1)[0] + ".js"
const file = Bun.file(filejs);

await file.write(numbers + content);
const output = transformFileSync(filejs, { plugins: [plugin] });
await file.delete();

console.log(builtins);
console.log(output?.code);
