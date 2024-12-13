import Handlebars from "handlebars";

// import { parseCSVBuffer } from "./csv";
// import { readFile, UPLOAD_DIR } from "../file";
// import path from "path";


const extractPlaceholders = (template: string) => {
  const regex = /{{(.*?)}}/g;
  let match;
  const placeholders = [];
  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1].trim());
  }
  return placeholders;
};

export const parseTemplate = (htmlTemplate: string, jsonData: object) => {
  const placeholders = extractPlaceholders(htmlTemplate);

  for (const field of placeholders){
    if (!Object.keys(jsonData).includes(field)) throw new Error(`Missing field: ${field}`);
  }
  
  const processedTemplate = Handlebars.compile(htmlTemplate, jsonData);
  let template = processedTemplate(jsonData);
  return template.replace(/[\n\r]+/g, '')
};


// async function test(){
//   const csvFile = await readFile(path.join(UPLOAD_DIR, "sample.csv"));
//   const parsedCSV = await parseCSVBuffer(csvFile);
//   try {
//     const htmlTemplate = await readFile(path.join(UPLOAD_DIR, "sample.html"));
//     const subject1 = await parseTemplate("Hello, {{recipient}}", (parsedCSV as object[])[0]);
//     const subject2 = await parseTemplate("Hello, email_id", (parsedCSV as object[])[0]);
//     let template = await parseTemplate(htmlTemplate.toString('utf-8'), (parsedCSV as object[])[0])
//     console.log(template)
//     console.log(subject1, subject2)
//   } catch(error){
//     console.error((error as Error).message)
//   }
// }

// test();
