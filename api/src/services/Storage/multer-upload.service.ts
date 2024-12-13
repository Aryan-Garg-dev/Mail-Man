import multer from "multer";
import { size } from "../../constant";
import { UPLOAD_DIR } from "../../utils/file";

const diskStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb)=>{
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * size.MB },
  fileFilter: (req, file, cb)=>{
    if (file.mimetype !== 'text/csv'){
      const error = new Error('Only csv files are allowed')
      return cb(error);
    }
    cb(null, true);
  }
})
