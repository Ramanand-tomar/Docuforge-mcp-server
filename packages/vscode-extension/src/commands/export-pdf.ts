import * as vscode from "vscode";
import type { DocuForgeClient } from "../mcp-client.js";

export function registerExportPdfCommand(
  context: vscode.ExtensionContext,
  client: DocuForgeClient,
) {
  const command = vscode.commands.registerCommand(
    "docuforge.exportPdf",
    async (docId?: string) => {
      if (!docId) {
        const docs = await client.listDocuments();
        if (docs.length === 0) {
          vscode.window.showWarningMessage("No documents found.");
          return;
        }
        const pick = await vscode.window.showQuickPick(
          docs.map((d) => ({ label: d.title, description: d.id, docId: d.id })),
          { placeHolder: "Select document to export" },
        );
        if (!pick) return;
        docId = pick.docId;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Exporting PDF...",
          },
          async () => {
            const result = await client.exportPdf(docId!);
            const uri = vscode.Uri.file(result.pdf_path);
            const action = await vscode.window.showInformationMessage(
              `PDF exported: ${result.pdf_path}`,
              "Open File",
            );
            if (action === "Open File") {
              await vscode.env.openExternal(uri);
            }
          },
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to export PDF: ${(err as Error).message}`,
        );
      }
    },
  );
  context.subscriptions.push(command);
}
