import { transformFileSync } from "@babel/core";
import plugin from "./plugin.ts";
import Bun from "bun";

const content = (await Bun.file("test.db").text())
	.replaceAll(";", "!")
	.replace(/([!?]+)\s*$/gm, "; // $1")
	.replace(/const\s*var/gm, "const")
	.replace(/var\s*const\s*(.*)/gm, "var $1 // const")
	.replace(/var\s*var/gm, "var")
	.replace(/const\s*const\s*(.*)/gm, "const $1 // const")

// console.log(content);
// process.exit(1);

await Bun.file("test.js").write(content);

const output = transformFileSync("./test.js", {
	plugins: [plugin],
});

await Bun.file("test.js").delete();

console.log(output?.code);
