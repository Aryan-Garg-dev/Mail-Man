import { parentPort, workerData } from "worker_threads";
import { compress } from "../utils/file";

try {
  const { data } = workerData;
  const compressedData = compress(data);
  parentPort?.postMessage({ success: true, result: compressedData.toString("base64") });
} catch(error){
  parentPort?.postMessage({ success: false, error: (error as Error).message })
}