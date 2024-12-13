import zlib from "zlib";
import path from "path"
import fs from "fs";
import { Readable } from "stream";

export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

export const compressAndSaveFile = (buffer: Buffer, fileName: string): Promise<string> => {
  return new Promise((resolve, reject)=>{
    const compressedFilePath = path.join(UPLOAD_DIR, `${fileName}.gz`);
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(compressedFilePath);
    const readStream = Readable.from(buffer);
    readStream.pipe(gzip).pipe(writeStream)
      .on('finish', ()=> resolve(compressedFilePath))
      .on('error', (err) => reject(new Error(`Error compressing file: ${err.message}`)));
  });
}

export const decompressFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject)=>{
    const gunzip = zlib.createGunzip();
    const chunks: Buffer[] = [];
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(gunzip);
    gunzip.on('data', (chunk)=>chunks.push(chunk));
    gunzip.on('end', ()=>resolve(Buffer.concat(chunks)))
    gunzip.on('error', (err) => reject(new Error(`Error decompressing file: ${err.message}`)));
  });
}

export const saveFile = (buffer: Buffer, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(new Error(`Error saving file: ${err.message}`));
      resolve(filePath);
    });
  });
};

export const readFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(new Error(`Error reading file: ${err.message}`));
      }
      resolve(data);
    });
  });
};

export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err)=>{
      if (err){
        console.error(`Error deleting file: ${err.message}`);
        return reject(new Error(`Error deleting file: ${err.message}`))
      }
      resolve();
    });
  });
}

export const compress = (data: any) => zlib.gzipSync(JSON.stringify(data))
export const decompress = (buffer: Buffer): string => {
  try {
    return zlib.gunzipSync(buffer).toString("utf-8");
  } catch (error) {
    console.error(error)
    throw new Error(`Decompression failed: ${(error as Error).message}`);
  }
};





