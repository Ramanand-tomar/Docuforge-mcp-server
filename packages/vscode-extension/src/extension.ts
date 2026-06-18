import * as vscode from "vscode";
import { DocuForgeClient } from "./mcp-client.js";
import { DocumentTreeProvider } from "./views/document-tree.js";
import { registerCreateDocumentCommand } from "./commands/create-document.js";
import { registerExportPdfCommand } from "./commands/export-pdf.js";
import { registerWriteWithAiCommand } from "./commands/write-with-ai.js";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("docuforge");
  const serverUrl = config.get<string>("serverUrl", "http://localhost:3000");
  const client = new DocuForgeClient(serverUrl);

  // Document tree view
  const treeProvider = new DocumentTreeProvider(client);
  vscode.window.registerTreeDataProvider("docuforgeDocuments", treeProvider);

  // Register commands
  const onRefresh = () => treeProvider.refresh();

  registerCreateDocumentCommand(context, client, onRefresh);
  registerExportPdfCommand(context, client);
  registerWriteWithAiCommand(context, client, onRefresh);

  // Refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand("docuforge.refreshDocuments", () => {
      treeProvider.refresh();
    }),
  );

  // Open document command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "docuforge.openDocument",
      async (docId: string) => {
        try {
          const doc = await client.getDocument(docId);
          const content = doc.rendered_content;
          const docUri = vscode.Uri.parse(
            `untitled:${doc.title}.${doc.format === "markdown" ? "md" : doc.format === "latex" ? "tex" : "txt"}`,
          );
          const editor = await vscode.workspace.openTextDocument({
            content,
            language:
              doc.format === "markdown"
                ? "markdown"
                : doc.format === "latex"
                  ? "latex"
                  : "plaintext",
          });
          await vscode.window.showTextDocument(editor);
        } catch (err) {
          vscode.window.showErrorMessage(
            `Failed to open document: ${(err as Error).message}`,
          );
        }
      },
    ),
  );

  // Check server connection on startup
  client.health().then(
    () => {
      vscode.window.showInformationMessage(
        "DocuForge: Connected to server",
      );
    },
    () => {
      vscode.window.showWarningMessage(
        `DocuForge: Cannot connect to server at ${serverUrl}. Start the server first.`,
      );
    },
  );
}

export function deactivate() {}
