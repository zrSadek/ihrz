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

import { Client, GuildMember } from 'discord.js';

import { BotEvent } from '../../../types/event';
import { DatabaseStructure } from '../../core/database_structure';

const processedMembers = new Set<string>();

export const event: BotEvent = {
    name: "guildMemberAdd",
    run: async (client: Client, member: GuildMember) => {
        /**
         * Why doing this?
         * On iHorizon Production, we have some ~discord.js problems~ 👎
         * All of the guildMemberAdd, guildMemberRemove sometimes emiting in double, triple, or quadruple.
         * As always, fuck discord.js
         */
        if (processedMembers.has(member.user.id)) return;
        processedMembers.add(member.user.id);
        setTimeout(() => processedMembers.delete(member.user.id), 2500);

        if (!member.guild || member.user.bot) return;

        let baseData = await client.db.get(`${member.guild.id}.GUILD.BLOCK_NEW_ACCOUNT`) as DatabaseStructure.BlockNewAccountSchema;

        if (!baseData) return;

        const accountCreationDate = member.user.createdAt;
        const currentTime = Date.now();
        const accountAge = currentTime - accountCreationDate.getTime();

        if (accountAge < baseData.req) {
            try {
                await member.kick("Account is too new");
            } catch { }
        }
    },
};