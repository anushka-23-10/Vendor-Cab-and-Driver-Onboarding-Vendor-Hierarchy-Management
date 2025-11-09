import multer from "multer";
import Document from "../models/document.model.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
export const upload = multer({ storage });

export const uploadDocument = async (req, res) => {
  try {
    const { type, issueDate, expiryDate, ownerType, ownerId } = req.body;
    const filePath = req.file.path;

    const doc = await Document.create({
      type,
      issueDate,
      expiryDate,
      ownerType,
      ownerId,
      filePath,
    });

    res.status(201).json({ message: "Document uploaded", doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ ownerId: req.params.ownerId });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
