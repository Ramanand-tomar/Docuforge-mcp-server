import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DocumentSummary } from "../api/client";

export function DocumentList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: api.listDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="divide-y divide-gray-200">
      {docs?.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          No documents yet. Create one to get started.
        </div>
      )}
      {docs?.map((doc: DocumentSummary) => (
        <div
          key={doc.id}
          className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
          onClick={() => onSelect(doc.id)}
        >
          <div>
            <h3 className="font-medium text-gray-900">{doc.title}</h3>
            <p className="text-sm text-gray-500">
              {doc.format} | {doc.sectionCount} sections |{" "}
              {new Date(doc.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this document?")) {
                deleteMutation.mutate(doc.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
