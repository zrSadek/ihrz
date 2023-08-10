/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

import {
    Client,
    Collection,
    EmbedBuilder,
    Permissions,
    ApplicationCommandType,
    PermissionsBitField,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    SelectMenuBuilder,
    ComponentType,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuOptionBuilder,
} from 'discord.js';

import { Command } from '../../../types/command';
import * as db from '../../core/functions/DatabaseModel';
import logger from '../../core/logger';
import config from '../../files/config';

import backup from 'discord-backup';
import ms from 'ms';

export const command: Command = {
    name: "allowlist",
    description: "Subcommand for protection category!",
    options: [
        {
            name: "list",
            description: "Make action about the allowlist",
            type: 2,
            options: [
                {
                    name: "add",
                    description: "Adding an user in the allowlist!",
                    type: 1,
                    options: [
                        {
                            name: 'member',
                            type: ApplicationCommandOptionType.User,
                            description: 'Whats is the member then?',
                            required: true
                        },
                    ],
                },
                {
                    name: "delete",
                    description: "Removing an user of the allowlist!",
                    type: 1,
                    options: [
                        {
                            name: 'member',
                            type: ApplicationCommandOptionType.User,
                            description: 'Whats is the member then?',
                            required: true
                        },
                    ],
                },
                {
                    name: "show",
                    description: "List the users in the allowlist!",
                    type: 1,
                },
            ],
        },
    ],
    category: 'protection',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);
        let command: any = interaction.options.getSubcommand();

        await require('./!' + command).run(client, interaction, data);
    },
};