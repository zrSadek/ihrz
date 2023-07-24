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
    name: 'rolereaction',
    description: 'Set a roles when user react to a message with specific emoji',
    options: [
        {
            name: "value",
            description: "Please make your choice.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Add another",
                    value: "add"
                },
                {
                    name: "Remove one",
                    value: "remove"
                }
            ]
        },
        {
            name: 'messageid',
            type: ApplicationCommandOptionType.String,
            description: `Please copy the identifiant of the message you want to configure`,
            required: true
        },
        {
            name: 'reaction',
            type: ApplicationCommandOptionType.String,
            description: `The emoji you want`,
            required: false
        },
        {
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            description: `The role you want to configure`,
            required: false
        }
    ],
    category: 'rolereactions',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: data.reactionroles_dont_admin_added });
        }
        let type = interaction.options.getString("value")
        let messagei = interaction.options.getString("messageid")
        let reaction = interaction.options.getString("reaction")
        let role = interaction.options.getRole("role")

        let help_embed = new EmbedBuilder()
            .setColor("#0000FF")
            .setTitle("/reactionroles Help !")
            .setDescription(data.reactionroles_embed_message_description_added)

        if (type == "add") {
            if (!role) { interaction.reply({ embeds: [help_embed] }) };
            if (!reaction) { return interaction.reply({ content: data.reactionroles_missing_reaction_added }) }

            try {
                await interaction.channel.messages.fetch(messagei).then((message: { react: (arg0: any) => void; }) => { message.react(reaction) });
            } catch {
                return interaction.reply({ content: data.reactionroles_dont_message_found });
            }
            let check = reaction.toString()

            if (check.includes("<") || check.includes(">") || check.includes(":")) {
                return interaction.reply({ content: data.reactionroles_invalid_emote_format_added })
            }
            await db.DataBaseModel({
                id: db.Set, key: `${interaction.guild.id}.GUILD.REACTION_ROLES.${messagei}.${reaction}`,
                value: {
                    rolesID: role.id, reactionNAME: reaction, enable: true
                }
            });

            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.reactionroles_logs_embed_title_added)
                    .setDescription(data.reactionroles_logs_embed_description_added
                        .replace("${interaction.user.id}", interaction.user.id)
                        .replace("${messagei}", messagei)
                        .replace("${reaction}", reaction)
                        .replace("${role}", role)
                    )
                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
            } catch (e: any) { logger.err(e) };

            return await interaction.reply({
                content: data.reactionroles_command_work_added
                    .replace("${messagei}", messagei)
                    .replace("${reaction}", reaction)
                    .replace("${role}", role)
                , ephemeral: true
            })
        } else {
            if (type == "remove") {
                let reactionLet = interaction.options.getString("reaction")

                if (!reactionLet) { return interaction.reply({ content: data.reactionroles_missing_remove }) }
                const message = await interaction.channel.messages.fetch(messagei);

                const fetched = await db.DataBaseModel({ id: db.Get, key: `${interaction.guild.id}.GUILD.REACTION_ROLES.${messagei}.${reaction}` });

                if (!fetched) { return interaction.reply({ content: data.reactionroles_missing_reaction_remove }) };
                const reactionVar = message.reactions.cache.get(fetched.reactionNAME);

                if (!reactionVar) { return interaction.reply({ content: data.reactionroles_cant_fetched_reaction_remove }) }
                await reactionVar.users.remove(client.user?.id).catch((err: string) => { logger.err(err) });

                await db.DataBaseModel({ id: db.Delete, key: `${interaction.guild.id}.GUILD.REACTION_ROLES.${messagei}.${reaction}` });

                try {
                    let logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle(data.reactionroles_logs_embed_title_remove)
                        .setDescription(data.reactionroles_logs_embed_description_remove
                            .replace("${interaction.user.id}", interaction.user.id)
                            .replace("${messagei}", messagei)
                            .replace("${reaction}", reaction)
                        )
                    let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                    if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
                } catch (e: any) { logger.err(e) };
                await interaction.reply({
                    content: data.reactionroles_command_work_remove
                        .replace("${reaction}", reaction)
                        .replace("${messagei}", messagei)
                    , ephemeral: true
                })
                /*End of Remove roles to users pleasssssssse horisus*/
            }
        }
    },
};