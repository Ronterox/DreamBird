import { transformFileSync } from "@babel/core";
import plugin from "./plugin.ts";
import Bun from "bun";

// bun build index.ts > index.js && cat test.db | sed 's/;/!/g' | sed 's/\\([!?]*\\)$/; \\/\\/\\1/g' > test.js
const content = (await Bun.file("test.db").text())
	.replaceAll(";", "!")
	.replace(/([!?]+)\s*$/gm, "; // $1")

await Bun.file("test.js").write(content);

const output = transformFileSync("./test.js", {
	plugins: [plugin],
});

await Bun.file("test.js").delete();

console.log(output?.code);
