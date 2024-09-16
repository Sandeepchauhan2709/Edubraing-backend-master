import multer from "multer";
const storage = multer.memoryStorage();

// Change singleUpload to handle multiple files
const upload = multer({ storage }).fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

export default upload;
