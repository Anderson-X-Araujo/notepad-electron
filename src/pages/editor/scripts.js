const { ipcRenderer } = require("electron");

// Elementos
const textArea = document.getElementById("text");
const title = document.getElementById("title");

// Set File criado no main
ipcRenderer.on("set-file", function (event, data) {
  textArea.value = data.content;
  title.innerHTML = data.name + " | Notepad Electron";
});

// Atualizar text area
function handleChangeText() {
  ipcRenderer.send("update-content", textArea.value);
}
