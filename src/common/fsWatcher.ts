import * as path from 'path';
import * as vscode from 'vscode';

export class FileSystemWatcher {
    private changedFiles: Set<string> = new Set();
    private timeout: NodeJS.Timer = null;

    constructor(private workspaceName: string, private languageId: string, private listener) {
        // createFileSystemWatcher has problems with Windows 7, so
        vscode.workspace.onDidSaveTextDocument(this.onChangeProjectFile.bind(this));
    }

    private onChangeProjectFile(doc: vscode.TextDocument) {
        if (doc.languageId !== this.languageId) {
            return;
        }

        // Filter by workspace
        let docWorkspace = vscode.workspace.getWorkspaceFolder(doc.uri);
        if (!docWorkspace || docWorkspace.name != this.workspaceName) {
            return
        }

        this.changedFiles.add(doc.fileName);

        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.listener(this.changedFiles);
            this.changedFiles = new Set();
        }, 2000);
    }
}
