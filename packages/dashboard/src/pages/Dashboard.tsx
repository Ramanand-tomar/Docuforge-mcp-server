import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentList } from "../components/DocumentList";
import { api } from "../api/client";

export function Dashboard({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("markdown");

  const createMutation = useMutation({
    mutationFn: () => api.createDocument(title, format),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setShowCreate(false);
      setTitle("");
      onSelect(data.document_id);
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">DocuForge</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowCreate(!showCreate)}
        >
          + New Document
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Create New Document</h2>
          <div className="flex gap-3">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="markdown">Markdown</option>
              <option value="latex">LaTeX</option>
              <option value="plain">Plain Text</option>
            </select>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              disabled={!title || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <DocumentList onSelect={onSelect} />
      </div>
    </div>
  );
}
