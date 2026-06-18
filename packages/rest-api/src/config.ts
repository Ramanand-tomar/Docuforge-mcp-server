export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  storageType: (process.env.STORAGE_TYPE || "memory") as "memory" | "sqlite",
  sqlitePath: process.env.SQLITE_PATH || "./data/docuforge.db",
  pdfOutputDir: process.env.PDF_OUTPUT_DIR || "./output",
  authEnabled: process.env.AUTH_ENABLED === "true",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
};
