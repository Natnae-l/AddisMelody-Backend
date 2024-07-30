import path from "path";
import multer from "multer";
import { StringDecoder } from "string_decoder";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, String(Date.now()) + ".mp3");
  },
});

const upload = multer({ storage: storage });

export default upload;
