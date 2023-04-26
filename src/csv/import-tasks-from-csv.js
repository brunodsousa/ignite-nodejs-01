import fs from "node:fs";
import axios from "axios";
import { parse } from "csv-parse";

const csvPath = new URL("./tasks.csv", import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ",",
  skipEmptyLines: true,
  fromLine: 2,
});

async function run() {
  const linesParse = stream.pipe(csvParse);

  for await (const line of linesParse) {
    const [title, description] = line;

    try {
      await axios.post(
        "http://localhost:3000/tasks",
        JSON.stringify({
          title,
          description,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }
}
run();
