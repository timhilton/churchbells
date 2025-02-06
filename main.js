const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const player = require('play-sound')();

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    startBellScheduler();

    ipcMain.on('get-time', () => {
        getCurrentTime();
    });
});

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    mainWindow.webContents.send('update-time', { hours, minutes, seconds });
}

function startBellScheduler() {
    setInterval(() => {
        const now = new Date();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12 || 12;

        if (minutes === 0) {
            playBellSound("hourly", hours);
        } else if (minutes === 15) {
            playBellSound("quarter", 1);
        } else if (minutes === 30) {
            playBellSound("quarter", 2);
        } else if (minutes === 45) {
            playBellSound("quarter", 3);
        }
    }, 60 * 1000);
}

function playBellSound(type, count) {
    let soundFile = type === "hourly" ? `bells-hour-${count}.mp3` : `audio/bells-quarter-${count}.mp3`;

    function playChime() {
        player.play(path.join(__dirname, soundFile), (err) => {
            if (err) {
                console.error("Error playing sound:", err);
            }
        });
    }

    playChime();
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});