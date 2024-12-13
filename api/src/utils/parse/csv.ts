import { Readable } from "stream"
import { parse } from "csv-parse"
/*
import { compress, decompress, readFile, UPLOAD_DIR } from "../file";
import path from "path";
*/

export const parseCSVBuffer = (buffer: Buffer) => {
  return new Promise((resolve, reject)=>{
    const results: any[] = [];
    const readableStream = Readable.from(buffer);
    readableStream
      .pipe(parse({ delimiter: ',', columns: true, skip_empty_lines: true }))
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/* 
async function test(){
  const csvBuffer = await readFile(path.join(UPLOAD_DIR, "sample.csv"));
  const compressCSV = compress(csvBuffer);
  const decompressedCSV = decompress(Buffer.from(compressCSV));
  const parsedCSV = await parseCSVBuffer(csvBuffer);
  console.log(parsedCSV);
}

test();
*/
