import { DocumentService } from "../services/document.service.js";

// Upload a document for a driver or vehicle
export const uploadDocument = async (req, res) => {
  try {
    const { type, issueDate, expiryDate, ownerType, ownerId } = req.body;
    const filePath = req.file ? req.file.path : null; // for uploaded files

    const docService = new DocumentService({
      type,
      issueDate,
      expiryDate,
      ownerType,
      ownerId,
      filePath,
    });

    const newDoc = await docService.upload();
    res.status(201).json({ message: "Document uploaded successfully ✅", document: newDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get documents for a specific driver/vehicle
export const getDocumentsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const docs = await DocumentService.getDocsByOwner(ownerId);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
