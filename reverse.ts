const code: string = `
var x = 1;

var word = "hi";
console.log(word, x);
word = "mom!";

x++;
reverse;
`;

const lines: string[] = code.split(";");

let inc: number = 1;

for (let i = 0; i >= 0 && i < lines.length; i += inc) {
    const line: string = lines[i].trim();

    if (line == "reverse") inc = -inc;
    else eval(line);
}
