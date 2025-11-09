// Manages document upload, validation, and expiry checks
// Demonstrates Encapsulation + Abstraction
import Document from "../models/document.model.js";

export class DocumentService {
  constructor(docData) {
    this.type = docData.type;
    this.issueDate = docData.issueDate;
    this.expiryDate = docData.expiryDate;
    this.filePath = docData.filePath;
    this.ownerType = docData.ownerType; // Driver or Vehicle
    this.ownerId = docData.ownerId;
  }

  async upload() {
    const doc = new Document({
      type: this.type,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      filePath: this.filePath,
      ownerType: this.ownerType,
      ownerId: this.ownerId,
    });
    return await doc.save();
  }

  isExpired() {
    return new Date(this.expiryDate) < new Date();
  }

  static async getDocsByOwner(ownerId) {
    return await Document.find({ ownerId });
  }
}
