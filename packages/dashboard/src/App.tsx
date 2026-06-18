import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { DocumentEditor } from "./pages/DocumentEditor";

export default function App() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return (
      <DocumentEditor
        docId={selectedDocId}
        onBack={() => setSelectedDocId(null)}
      />
    );
  }

  return <Dashboard onSelect={setSelectedDocId} />;
}
