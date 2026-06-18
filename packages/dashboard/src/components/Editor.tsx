import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type FullDocument } from "../api/client";

export function Editor({ doc }: { doc: FullDocument }) {
  const queryClient = useQueryClient();
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const appendMutation = useMutation({
    mutationFn: ({
      section,
      content,
    }: {
      section: string;
      content: string;
    }) => api.appendSection(doc.id, section, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", doc.id] });
      setNewSectionTitle("");
      setNewSectionContent("");
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      sectionId,
      content,
    }: {
      sectionId: string;
      content: string;
    }) => api.editSection(doc.id, sectionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", doc.id] });
      setEditingSection(null);
    },
  });

  return (
    <div className="space-y-4">
      {/* Existing sections */}
      {doc.sections.map((section) => (
        <div key={section.id} className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
          {editingSection === section.id ? (
            <div>
              <textarea
                className="w-full h-32 border rounded p-2 font-mono text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={() =>
                    editMutation.mutate({
                      sectionId: section.id,
                      content: editContent,
                    })
                  }
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => setEditingSection(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {section.content}
              </pre>
              <button
                className="mt-2 text-blue-600 text-sm hover:underline"
                onClick={() => {
                  setEditingSection(section.id);
                  setEditContent(section.content);
                }}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add new section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Add New Section</h3>
        <input
          className="w-full border rounded p-2 mb-2"
          placeholder="Section title"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <textarea
          className="w-full h-24 border rounded p-2 font-mono text-sm mb-2"
          placeholder="Section content (markdown supported)"
          value={newSectionContent}
          onChange={(e) => setNewSectionContent(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
          disabled={!newSectionTitle || appendMutation.isPending}
          onClick={() =>
            appendMutation.mutate({
              section: newSectionTitle,
              content: newSectionContent,
            })
          }
        >
          {appendMutation.isPending ? "Adding..." : "Add Section"}
        </button>
      </div>
    </div>
  );
}
