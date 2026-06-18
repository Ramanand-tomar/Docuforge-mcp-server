import { useState } from "react";
import { api } from "../api/client";

export function ExportButton({ docId }: { docId: string }) {
  const [exporting, setExporting] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await api.exportPdf(docId);
      setPdfPath(result.pdf_path);
    } catch (err) {
      alert(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? "Exporting..." : "Export PDF"}
      </button>
      {pdfPath && (
        <p className="text-sm text-green-600 mt-2">
          PDF saved: {pdfPath}
        </p>
      )}
    </div>
  );
}
