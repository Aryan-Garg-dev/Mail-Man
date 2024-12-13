import { parentPort, workerData } from "worker_threads";
import { decompress } from "../utils/file";

try {
  const { data } = workerData;
  const decompressedData = decompress(Buffer.from(data, 'base64'));
  // console.log(decompressedData)
  parentPort?.postMessage({ success: true, result: decompressedData });
} catch(error){
  parentPort?.postMessage({ success: false, error: (error as Error).message })
}