import { parentPort, workerData } from "worker_threads";
import { parseTemplate } from "../utils/parse/html-template";

try {
  const { htmlTemplate, rowData } = workerData;
  const htmlContent = parseTemplate(htmlTemplate as string, rowData as object);
  parentPort?.postMessage({ success: true, result: htmlContent });
} catch(error){
  parentPort?.postMessage({ success: false, error: (error as Error).message })
}