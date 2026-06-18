import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Editor } from "../components/Editor";
import { Preview } from "../components/Preview";
import { ExportButton } from "../components/ExportButton";

export function DocumentEditor({
  docId,
  onBack,
}: {
  docId: string;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: doc, isLoading } = useQuery({
    queryKey: ["document", docId],
    queryFn: () => api.getDocument(docId),
  });

  const formatMutation = useMutation({
    mutationFn: (style: string) => api.formatDocument(docId, style),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["document", docId] }),
  });

  if (isLoading)
    return <div className="p-6 text-gray-500">Loading document...</div>;
  if (!doc) return <div className="p-6 text-red-500">Document not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            className="text-blue-600 hover:underline"
            onClick={onBack}
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
            {doc.format}
          </span>
          {doc.style && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
              {doc.style}
            </span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="border rounded px-3 py-2 text-sm"
            value={doc.style || ""}
            onChange={(e) => {
              if (e.target.value) formatMutation.mutate(e.target.value);
            }}
          >
            <option value="">Apply Style...</option>
            <option value="academic">Academic</option>
            <option value="resume">Resume</option>
            <option value="report">Report</option>
            <option value="blog">Blog</option>
          </select>
          <ExportButton docId={docId} />
        </div>
      </div>

      {/* Split view: Editor + Preview */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Edit</h2>
          <Editor doc={doc} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <Preview content={doc.rendered_content} />
        </div>
      </div>
    </div>
  );
}
