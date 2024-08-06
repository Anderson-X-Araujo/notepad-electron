const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
} = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Auto Reload
// require("electron-reload")(__dirname);

// Janela Principal
let mainWindow = null;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  await mainWindow.loadFile("src/pages/editor/index.html");

  // mainWindow.webContents.openDevTools();
  createNewFile();

  ipcMain.on("update-content", function (event, data) {
    file.content = data;
  });
}

// Arquivo
let file = {};

// Criar novo arquivo
function createNewFile() {
  file = {
    name: "novo-arquivo.txt",
    content: "",
    saved: false,
    path: app.getPath("documents") + "/novo-arquivo.txt",
  };

  mainWindow.webContents.send("set-file", file);
}

// Salvar arquivo no disco
function writeFile(filePath) {
  try {
    fs.writeFile(filePath, file.content, function (error) {
      // Erro
      if (error) throw error;

      // Arquivo salvo
      file.path = filePath;
      file.saved = true;
      file.name = path.basename(filePath);

      mainWindow.webContents.send("set-file", file);
    });
  } catch (error) {
    console.log(error);
  }
}

// Salvar como
async function saveFileAs() {
  // Dialog
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path,
  });

  // Verificar cancelamento
  if (dialogFile.canceled) {
    return false;
  }

  // Salvar arquivo
  writeFile(dialogFile.filePath);
}

// Salvar arquivo
function saveFile() {
  // Save
  if (file.saved) {
    return writeFile(file.path);
  }

  // Salvar como
  return saveFileAs();
}

// Ler o arquivo existente
function readyFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.log(error);
    return "";
  }
}

// Abrir arquivo
async function openFile() {
  // Diálogo
  let dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path,
  });

  // Verificar cancelamento
  if (dialogFile.canceled) {
    return false;
  }

  // Abrir o arquivo
  file = {
    name: path.basename(dialogFile.filePaths[0]),
    content: readyFile(dialogFile.filePaths[0]),
    saved: true,
    path: dialogFile.filePaths[0],
  };

  mainWindow.webContents.send("set-file", file);
}

// Ajuda - Sobre
async function helpAbout() {
  const platform = os.platform();
  const release = os.release();
  const v8Version = process.versions.v8;

  // Dialog
  let dialogFile = await dialog.showMessageBox({
    type: "info",
    title: "Notepad Electron",
    message: `Versão: 1.0.0\nAutor: Anderson Araujo\nData: 2024-08-06T22:00:00.0000Z\nElectron: 31.3.1\nNode.js: 18.17.0\nV8: ${process.versions.v8}\nSO: ${platform} ${release}`,
  });
}

// Template Menu
const templateMenu = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Novo",
        accelerator: "CmdOrCtrl+N",
        click() {
          createNewFile();
        },
      },
      {
        label: "Abrir",
        accelerator: "CmdOrCtrl+O",
        click() {
          openFile();
        },
      },
      {
        label: "Salvar",
        accelerator: "CmdOrCtrl+S",
        click() {
          saveFile();
        },
      },
      {
        label: "Salvar como",
        accelerator: "CmdOrCtrl+Shift+S",
        click() {
          saveFileAs();
        },
      },
      {
        label: "Fechar",
        role: process.platform === "darwin" ? "close" : "quit", // 'darwin' é MacOS
      },
    ],
  },
  {
    label: "Editar",
    submenu: [
      {
        label: "Desfazer",
        role: "undo",
      },
      {
        label: "Refazer",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Copiar",
        role: "copy",
      },
      {
        label: "Recortar",
        role: "cut",
      },
      {
        label: "Colar",
        role: "paste",
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Documentação",
        click() {
          shell.openExternal("https://www.electronjs.org/docs/latest/");
        },
      },
      {
        label: "Sobre",
        click() {
          helpAbout();
        },
      },
    ],
  },
];

// Menu
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

// On Ready
app.whenReady().then(createWindow);

// Activate (MacOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
