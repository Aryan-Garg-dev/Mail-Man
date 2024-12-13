import { parentPort, workerData } from "worker_threads";
import { parseCSVBuffer } from "../utils/parse/csv";
import { compress, decompress, readFile } from "../utils/file";


const { filePath } = workerData;
readFile(filePath).then(
  (fileBuffer)=>{
    parseCSVBuffer(fileBuffer).then((data)=>{
      parentPort?.postMessage({ success: true, result: data });
    }).catch((error)=>{
      parentPort?.postMessage({ success: false, error: error.message });
    })
  }  
).catch((error)=>{
  parentPort?.postMessage({ success: false, error: error.message });
})
    

