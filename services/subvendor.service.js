// SubVendor inherits from VendorService
// Demonstrates Inheritance + Polymorphism
import { VendorService } from "./vendor.service.js";

export class SubVendorService extends VendorService {
  constructor(data) {
    super(data);
  }

  async createVendor() {
    if (this.role !== "SubVendor") {
      throw new Error("Only sub-vendors can be created using this service");
    }
    return await super.createVendor();
  }
}
