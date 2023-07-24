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
    ChannelType,
    EmbedBuilder,
    Permissions,
    ApplicationCommandType,
    PermissionsBitField,
    ApplicationCommandOptionType
} from 'discord.js'

import { Command } from '../../../types/command';
import * as db from '../../core/functions/DatabaseModel';
import { QueryType } from 'discord-player';
import logger from '../../core/logger';

export const command: Command = {
    name: 'pause',
    description: 'Pause the current playing song!',
    category: 'music',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);

        if (!interaction.member.voice.channel) return interaction.reply({ content: data.pause_no_queue });
        try {
            const queue = interaction.client.player.nodes.get(interaction.guild);
            if (!queue || !queue.isPlaying()) {
                return interaction.reply({ content: data.pause_nothing_playing, ephemeral: true });
            }
            const paused = queue.node.setPaused(true);
            interaction.reply({ content: paused ? 'paused' : "something went wrong" });
            return;
        } catch (error: any) {
            logger.err(error);
        }
    },
};