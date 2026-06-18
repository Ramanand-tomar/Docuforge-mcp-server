export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Document not found: ${id}`);
    this.name = "DocumentNotFoundError";
  }
}

export class SectionNotFoundError extends Error {
  constructor(sectionId: string, documentId: string) {
    super(`Section ${sectionId} not found in document ${documentId}`);
    this.name = "SectionNotFoundError";
  }
}
