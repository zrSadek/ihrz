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
import backup from 'discord-backup';

export const command: Command = {
    name: "backup",
    description: "Manage, create and delete a guild backups !",
    options: [
        {
            name: 'action',
            type: ApplicationCommandOptionType.String,
            description: 'What you want to do?',
            required: true,
            choices: [
                {
                    name: 'Create a backup',
                    value: "create"
                },
                {
                    name: 'Load your backup',
                    value: "load"
                },
                {
                    name: 'See your backup(s)',
                    value: "see"
                }
            ],
        },
        {
            name: 'backup-id',
            type: ApplicationCommandOptionType.String,
            description: 'Whats is the backup id?',
            required: false
        }
    ],
    category: 'backup',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);

        let backup_options = interaction.options.getString('action');
        let backupID = interaction.options.getString('backup-id');

        await interaction.reply({ content: data.backup_wait_please });

        if (backup_options === "create") {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply({ content: data.backup_not_admin });
            }
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply({ content: data.backup_i_dont_have_permission })
            }
            let i: any = 0; let j: any = 0;

            backup.create(interaction.guild, {
                maxMessagesPerChannel: 15,
                jsonBeautify: true
            }).then(async (backupData) => {
                await backupData.channels.categories.forEach(category => { i++; category.children.forEach(() => { j++; }); });
                let elData = { guildName: backupData.name, categoryCount: i, channelCount: j };

                await db.DataBaseModel({ id: db.Set, key: `BACKUPS.${interaction.user.id}.${backupData.id}`, value: elData });

                interaction.channel.send({ content: data.backup_command_work_on_creation });
                interaction.editReply({
                    content: data.backup_command_work_info_on_creation
                        .replace("${backupData.id}", backupData.id)
                });
                try {
                    let logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle(data.backup_logs_embed_title_on_creation)
                        .setDescription(data.backup_logs_embed_description_on_creation)
                    let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'iHorizon-logs');
                    if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
                } catch (e: any) { logger.err(e) };
            });
        }

        if (backup_options === "load") {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply({ content: data.backup_dont_have_perm_on_load });
            }
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply({ content: data.backup_i_dont_have_perm_on_load })
            }

            if (!backupID) {
                return interaction.editReply({ content: data.backup_unvalid_id_on_load });
            }

            if (backupID && !await db.DataBaseModel({ id: db.Get, key: `BACKUPS.${interaction.user.id}.${backupID}` })) {
                return interaction.editReply({ content: "❌ | This is not your backup !" });
            };

            await interaction.channel.send({ content: data.backup_waiting_on_load });

            backup.fetch(backupID).then(async () => {
                backup.load(backupID, interaction.guild).then(() => {
                    backup.remove(backupID);
                }).catch((err) => {
                    return interaction.channel.send({
                        content: data.backup_error_on_load
                            .replace("${backupID}", backupID)
                        , ephemeral: true
                    });
                });
            }).catch((err) => {
                return interaction.channel.send({ content: `❌` });
            });
        }

        if (backup_options === "see") {
            // If the user provided a backup ID, show the backup's info.

            if (backupID && !await db.DataBaseModel({ id: db.Get, key: `BACKUPS.${interaction.user.id}.${backupID}` })) {
                return interaction.editReply({ content: "❌ | This is not your backup !" });
            };

            if (backupID) {
                let data = await db.DataBaseModel({ id: db.Get, key: `BACKUPS.${interaction.user.id}.${backupID}` });

                if (!data) return interaction.editReply({ content: "ERROR? Backup don't exist." });
                let v = `:placard:・Category's Count: \`${data.categoryCount}\`\n:hash:・Channel's Count: \`${data.channelCount}\``
                let em = new EmbedBuilder().setColor("#bf0bb9").setTimestamp().addFields({ name: `${data.guildName} - (||${backupID}||)`, value: v });
                return interaction.editReply({ content: ' ', embeds: [em] });
            }
            // If the user didn't provide a backup ID, show all the backups.
            else {
                let em = new EmbedBuilder().setDescription("**All of your backup:** ").setColor("#bf0bb9").setTimestamp();
                let data2 = await db.DataBaseModel({ id: db.Get, key: `BACKUPS.${interaction.user.id}` });
                let b: any = 1;
                for (const i in data2) {
                    let result = await db.DataBaseModel({ id: db.Get, key: `BACKUPS.${interaction.user.id}.${i}` });
                    let v = `:placard:・Category's Count: \`${result.categoryCount}\`\n:hash:・Channel's Count: \`${result.channelCount}\``
                    if (result) em.addFields({ name: `${result.guildName} - (||${i}||)`, value: v }) && b++;
                };

                return interaction.editReply({ content: ' ', embeds: [em] });
            }
        }
    },
};