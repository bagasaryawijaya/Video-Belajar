import fs from "fs";

const file = "./video-belajar-firebase-adminsdk.json";

const base64 = fs.readFileSync(file).toString("base64");

console.log(base64);