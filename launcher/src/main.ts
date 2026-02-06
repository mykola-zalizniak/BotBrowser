import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Neutralino from '@neutralinojs/lib';

Neutralino.init();
Neutralino.events.on('windowClose', () => Neutralino.app.exit());

// macOS: set native Edit menu to enable Cmd+C/V/X/A keyboard shortcuts
Neutralino.events.on('ready', async () => {
    if (NL_OS === 'Darwin') {
        await Neutralino.window.setMainMenu([
            {
                text: 'Edit',
                menuItems: [
                    { id: 'undo', text: 'Undo', action: 'undo:', shortcut: 'z' },
                    { id: 'redo', text: 'Redo', action: 'redo:', shortcut: 'Z' },
                    { id: 'sep1', text: '-' },
                    { id: 'cut', text: 'Cut', action: 'cut:', shortcut: 'x' },
                    { id: 'copy', text: 'Copy', action: 'copy:', shortcut: 'c' },
                    { id: 'paste', text: 'Paste', action: 'paste:', shortcut: 'v' },
                    { id: 'selectAll', text: 'Select All', action: 'selectAll:', shortcut: 'a' },
                ],
            },
        ]);
    }
});

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
