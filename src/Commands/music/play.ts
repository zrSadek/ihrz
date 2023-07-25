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

export const command: Command = {
    name: 'play',
    description: 'Play a song!',
    options: [
        {
            name: 'title',
            type: ApplicationCommandOptionType.String,
            description: 'The track title you want (you can put URL as you want)',
            required: true
        }
    ],
    category: 'music',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);
        const voiceChannel = interaction.member.voice.channel;
        const check = interaction.options.getString("title");

        if (!voiceChannel) { return interaction.reply({ content: data.p_not_in_voice_channel }); };

        // if (!client.functions.isLinkAllowed(check)) { return interaction.reply({ content: data.p_not_allowed }) };

        try {
            const result = await interaction.client.player.search(check, {
                requestedBy: interaction.user, searchEngine: QueryType.AUTO
            })

            const results = new EmbedBuilder()
                .setTitle(data.p_embed_title)
                .setColor(`#ff0000`)
                .setTimestamp()

            if (!result.hasTracks()) {
                return interaction.reply({ embeds: [results] })
            }

            await interaction.reply({
                content: data.p_loading_message
                    .replace("{result}", result.playlist ? 'playlist' : 'track')
            })

            const yes = await interaction.client.player.play(interaction.member.voice.channel?.id, result, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild?.members.me,
                        requestedBy: interaction.user.username
                    },
                    volume: 60,
                    bufferingTimeout: 3000,
                    leaveOnEnd: true,
                },
            })

            const embed = new EmbedBuilder()
            function yess() {
                const totalDurationMs = yes.track.playlist.tracks.reduce((a: any, c: { durationMS: any; }) => c.durationMS + a, 0)
                const totalDurationSec = Math.floor(totalDurationMs / 1000);
                const hours = Math.floor(totalDurationSec / 3600);
                const minutes = Math.floor((totalDurationSec % 3600) / 60);
                const seconds = totalDurationSec % 60;
                const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                return durationStr
            }

            embed
                .setDescription(`${yes.track.playlist ? `**multiple tracks** from: **${yes.track.playlist.title}**` : `**${yes.track.title}**`}`)
                .setThumbnail(`${yes.track.playlist ? `${yes.track.playlist.thumbnail.url}` : `${yes.track.thumbnail}`}`)
                .setColor(`#d0ff00`)
                .setTimestamp()
                .setFooter({ text: data.p_duration + `${yes.track.playlist ? `${yess()}` : `${yes.track.duration}`}` })
            return interaction.editReply({ content: "", embeds: [embed] })
        } catch (error) { };
    },
};