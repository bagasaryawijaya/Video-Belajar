import fs from "fs";

const file = "./serviceAccountKey.json";

const base64 = fs.readFileSync(file).toString("base64");

console.log(base64);