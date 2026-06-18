import * as vscode from "vscode";
import type { DocuForgeClient } from "../mcp-client.js";

export class DocumentItem extends vscode.TreeItem {
  constructor(
    public readonly docId: string,
    public readonly label: string,
    public readonly format: string,
    public readonly sectionCount: number,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${label} (${format}) - ${sectionCount} sections`;
    this.description = `${format} | ${sectionCount} sections`;
    this.contextValue = "document";
    this.command = {
      command: "docuforge.openDocument",
      title: "Open Document",
      arguments: [docId],
    };
  }
}

export class DocumentTreeProvider
  implements vscode.TreeDataProvider<DocumentItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    DocumentItem | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: DocuForgeClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: DocumentItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<DocumentItem[]> {
    try {
      const docs = await this.client.listDocuments();
      return docs.map(
        (doc) =>
          new DocumentItem(doc.id, doc.title, doc.format, doc.sectionCount),
      );
    } catch {
      return [];
    }
  }
}
