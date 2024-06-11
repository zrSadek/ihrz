/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import { initializeDatabase, getDatabaseInstance } from './database.js';
import commandsSync from './commandsSync.js';
import bash from './bash/bash.js';
import logger from "./logger.js";

import * as errorManager from './modules/errorManager.js';
import playerManager from "./modules/playerManager.js";
import { OwnIHRZ } from './modules/ownihrzManager.js';
import emojis from './modules/emojisManager.js';

import { VanityInviteData } from '../../types/vanityUrlData';
import { ConfigData } from '../../types/configDatad.js';

import { Client, Collection, Snowflake, DefaultWebSocketManagerOptions } from "discord.js";
import { GiveawayManager } from 'discord-regiveaways';
import { readdirSync } from "node:fs";
import backup from 'discord-rebackup';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import { LyricsManager } from './functions/lyrics-fetcher.js';
import { iHorizonTimeCalculator } from './functions/ms.js';
import assetsCalc from "./functions/assetsCalc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backups_folder = `${process.cwd()}/src/files/backups`;

let global_config: ConfigData;

if (!fs.existsSync(backups_folder)) {
    fs.mkdirSync(backups_folder, { recursive: true });
}

backup.setStorageFolder(backups_folder);

export async function main(client: Client) {
    initConfig(client.config);

    logger.legacy("[*] iHorizon Discord Bot (https://github.com/ihrz/ihrz).".gray());
    logger.legacy("[*] Warning: iHorizon Discord bot is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 2.0.".gray());
    logger.legacy("[*] Please respect the terms of this license. Learn more at: https://creativecommons.org/licenses/by-nc-sa/2.0".gray());

    errorManager.uncaughtExceptionHandler(client);

    client.giveawaysManager = new GiveawayManager(client, {
        storage: `${process.cwd()}/src/files/giveaways/`,
        config: {
            botsCanWin: false,
            embedColor: '#9a5af2',
            embedColorEnd: '#2f3136',
            reaction: '🎉',
            botName: "iHorizon",
            forceUpdateEvery: 3600,
            endedGiveawaysLifetime: 345_600_000,
        },
    });

    process.on('SIGINT', async () => {
        client.destroy();
        await new OwnIHRZ().QuitProgram(client);
        process.exit();
    });

    assetsCalc(client);
    playerManager(client);
    bash(client);
    emojis(client);

    await initializeDatabase(client.config);
    client.db = getDatabaseInstance();
    client.content = [];
    client.category = [];
    client.invites = new Collection();
    client.timeCalculator = new iHorizonTimeCalculator();
    client.lyricsSearcher = new LyricsManager();
    client.vanityInvites = new Collection<Snowflake, VanityInviteData>();

    let handlerPath = path.join(__dirname, '..', 'core', 'handlers');
    let handlerFiles = readdirSync(handlerPath).filter(file => file.endsWith('.js'));

    for (const file of handlerFiles) {
        const { default: handlerFunction } = await import(`${handlerPath}/${file}`);
        if (handlerFunction && typeof handlerFunction === 'function') {
            await handlerFunction(client);
        }
    }

    if (client.config.discord.phonePresence) {

        const { identifyProperties } = DefaultWebSocketManagerOptions;

        Object.defineProperty(identifyProperties, 'browser', {
            value: "Discord Android",
            writable: true,
            enumerable: true,
            configurable: true
        });
    };

    client.login(process.env.BOT_TOKEN || client.config.discord.token).then(() => {
        commandsSync(client).then(() => {
            logger.log("(_) /\\  /\\___  _ __(_)_______  _ __  ".magenta());
            logger.log("| |/ /_/ / _ \\| '__| |_  / _ \\| '_ \\ ".magenta());
            logger.log("| / __  / (_) | |  | |/ / (_) | | | |".magenta());
            logger.log(`|_\\/ /_/ \\___/|_|  |_/___\\___/|_| |_| (${client.user?.tag}).`.magenta());
            logger.log(`${client.config.console.emojis.KISA} >> Mainly dev by Kisakay ♀️`.magenta());
        });
    });
};

export const initConfig = (config: ConfigData) => {
    global_config = config
};

export const getConfig = (): ConfigData => {
    if (!global_config) {
        throw new Error('Configuration file has not been initialized. Call initConfig first.');
    }
    return global_config;
};