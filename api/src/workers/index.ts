import path from "path";
import { Worker } from "worker_threads";

export const csvParserPath = path.join(__dirname, 'csv-parser.worker');
export const templateParserPath = path.join(__dirname, 'template-parser.worker');
export const decompressorPath = path.join(__dirname, "decompressor.worker")
export const compressorPath = path.join(__dirname, "compressor.worker")

export const runWorker = (workerPath: string, workerData: any): Promise<any> => {
  return new Promise((resolve, reject)=>{
    const worker = new Worker(workerPath, { workerData });
    worker.on("message", (response)=>{
      if (response.success) resolve(response.result);
      else reject(new Error(response.error))
    });
    worker.on("error", (error)=>{
      worker.terminate();
      reject(error);
    });
    worker.on("exit", (code)=>{
      if (code != 0) reject(new Error(`Worker stopper with exit code: ${code}`))
    })
  })
}