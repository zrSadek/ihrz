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
import logger from '../../core/logger';
import ms from 'ms';
import config from '../../files/config';

export const command: Command = {
    name: 'membercount',
    description: 'Set a member count channels!',
    options: [
        {
            name: "action",
            description: "<Power on /Power off>",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Power on",
                    value: "on"
                },
                {
                    name: "Power off",
                    value: "off"
                },
            ]
        },
        {
            name: "channel",
            description: `The channel to set the member count`,
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: 'name',
            required: false,
            type: ApplicationCommandOptionType.String,
            description: `{botcount}, {rolescount}, {membercount}`
        },
    ],
    category: 'membercount',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: data.setmembercount_not_admin });
        }
        let type = interaction.options.getString("action")
        let messagei = interaction.options.getString("name")
        let channel = interaction.options.getChannel("channel")

        let help_embed = new EmbedBuilder()
            .setColor("#0014a8")
            .setTitle(data.setmembercount_helpembed_title)
            .setDescription(data.setmembercount_helpembed_description)
            .addFields({ name: data.setmembercount_helpembed_fields_name, value: data.setmembercount_helpembed_fields_value })

        if (type == "on") {
            const botMembers = interaction.guild.members.cache.filter((member: { user: { bot: any; }; }) => member.user.bot);
            const rolesCollection = interaction.guild.roles.cache;
            const rolesCount = rolesCollection.size;

            if (messagei) {
                let joinmsgreplace = messagei
                    .replace("{rolescount}", rolesCount)
                    .replace("{membercount}", interaction.guild.memberCount)
                    .replace("{botcount}", botMembers.size)

                if (messagei.includes("member")) {
                    await db.DataBaseModel({
                        id: db.Set, key: `${interaction.guild.id}.GUILD.MCOUNT.member`, values:
                            { name: messagei, enable: true, event: "member", channel: channel.id }
                    });

                } else if (messagei.includes("roles")) {
                    await db.DataBaseModel({
                        id: db.Set, key: `${interaction.guild.id}.GUILD.MCOUNT.roles`, values:
                            { name: messagei, enable: true, event: "roles", channel: channel.id }
                    });
                } else if (messagei.includes("bot")) {
                    await db.DataBaseModel({
                        id: db.Get, key: `${interaction.guild.id}.GUILD.MCOUNT.bot`, values:
                            { name: messagei, enable: true, event: "bot", channel: channel.id }
                    });
                }
                try {
                    const logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle(data.setmembercount_logs_embed_title_on_enable)
                        .setDescription(data.setmembercount_logs_embed_description_on_enable
                            .replace(/\${interaction\.user\.id}/g, interaction.user.id)
                            .replace(/\${channel\.id}/g, channel.id)
                            .replace(/\${messagei}/g, messagei)
                        )
                    let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                    if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
                } catch (e: any) { logger.err(e) };
                const fetched = interaction.guild.channels.cache.get(channel.id);

                await fetched.edit({ name: joinmsgreplace });
                return interaction.reply({ content: data.setmembercount_command_work_on_enable })
            }
        } else {
            if (type == "off") {
                await db.DataBaseModel({ id: db.Delete, key: `${interaction.guild.id}.GUILD.MCOUNT` });
                try {
                    const logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle(data.setmembercount_logs_embed_title_on_disable)
                        .setDescription(data.setmembercount_logs_embed_description_on_disable
                            .replace(/\${interaction\.user\.id}/g, interaction.user.id)
                        )
                    let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                    if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
                } catch (e: any) { logger.err(e) };
                return interaction.reply({ content: data.setmembercount_command_work_on_disable });
            }
        }
        if (!type) {
            return interaction.reply({ embeds: [help_embed] });
        }
        if (!messagei) {
            return interaction.reply({ embeds: [help_embed] });
        }
    },
};