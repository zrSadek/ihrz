const { Client, Intents, Collection, EmbedBuilder, Permissions } = require('discord.js');
const config = require('../config.json');
const fs = require("fs")
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const logger = require(`${process.cwd()}/files/core/logger`);

const yaml = require('js-yaml');
const getLanguage = require(`${process.cwd()}/files/lang/getLanguage`);
module.exports = async (client, member, members) => {
  let fileContents = fs.readFileSync(`${process.cwd()}/files/lang/${await getLanguage(member.guild.id)}.yml`, 'utf-8');
  let data = yaml.load(fileContents);

  async function joinRoles() {
    try {
      let roleid = await db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.joinroles`)
      if (roleid == null) return;
      if (!roleid) return;
      member.roles.add(roleid);
    } catch (e) { return logger.err(e) }
  };

  async function joinDm() {
    try {
      let msg_dm = await db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.joindm`)
      if (msg_dm == null) return;
      if (!msg_dm) return;
      if (msg_dm === "off") return
      member.send({ content: "This is a Join DM from " + member.guild.id + " ! \n \n" + msg_dm })
        .catch(() => { })
    } catch (e) { return }
  };

  async function blacklistFetch() {
    try {
      d = await db.get(`${members.guild.id}.USER.${members.user.id}.ECONOMY.money`)
      if (!d) { await db.set(`${members.guild.id}.USER.${members.user.id}.ECONOMY.money`, 1) }

      var potential_blacklisted = db.get(`GLOBAL.BLACKLIST.${members.user.id}.blacklisted`)
      if (potential_blacklisted === "yes") {
        members.send({ content: "You'r are been ban, because you are blacklisted" }).catch(members.ban({ reason: 'blacklisted!' }))
        members.ban({ reason: 'blacklisted!' })
      } else { return };
    } catch { return }
  };

  async function memberCount() {
    try {
      const botMembers = member.guild.members.cache.filter(member => member.user.bot);
      const rolesCollection = member.guild.roles.cache;
      const rolesCount = rolesCollection.size;

      let bot = await db.get(`${member.guild.id}.GUILD.MCOUNT.bot`)
      let member_2 = await db.get(`${member.guild.id}.GUILD.MCOUNT.member`)
      let roles = await db.get(`${member.guild.id}.GUILD.MCOUNT.roles`)

      if (bot) {
        let joinmsgreplace = bot.name
          .replace("{rolescount}", rolesCount)
          .replace("{membercount}", member.guild.memberCount)
          .replace("{botcount}", botMembers.size)

        const fetched = member.guild.channels.cache.get(bot.channel);
        await fetched.edit({ name: joinmsgreplace })
      }

      if (member_2) {
        let joinmsgreplace = member_2.name
          .replace("{rolescount}", rolesCount)
          .replace("{membercount}", member.guild.memberCount)
          .replace("{botcount}", botMembers.size)

        const fetched = member.guild.channels.cache.get(member_2.channel);
        await fetched.edit({ name: joinmsgreplace })
      }

      if (roles) {
        let joinmsgreplace = roles.name
          .replace("{rolescount}", rolesCount)
          .replace("{membercount}", member.guild.memberCount)
          .replace("{botcount}", botMembers.size)

        const fetched = member.guild.channels.cache.get(roles.channel);
        await fetched.edit({ name: joinmsgreplace })
      }
    } catch (e) { return }
  };

  async function welcomeMessage() {
    try {
      const newInvites = await member.guild.invites.fetch()
      const oldInvites = client.invites.get(member.guild.id);
      const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
      const inviter = await client.users.fetch(invite.inviter.id)

      checked = db.get(`${invite.guild.id}.USER.${inviter.id}.INVITES.DATA`)

      if (checked) {
        await db.add(`${invite.guild.id}.USER.${inviter.id}.INVITES.DATA.regular`, 1);
        await db.add(`${invite.guild.id}.USER.${inviter.id}.INVITES.DATA.invites`, 1);
      }
      let fetched = await db.get(`${invite.guild.id}.USER.${inviter.id}.INVITES.DATA.invites`);

      let wChan = await db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.join`)
      if (!wChan) return;
      let messssssage = await db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.joinmessage`)
      if (!messssssage) {
        return client.channels.cache.get(wChan).send({
          content: data.event_welcomer_inviter
            .replace("${member.id}", member.id)
            .replace("${member.user.createdAt.toLocaleDateString()}", member.user.createdAt.toLocaleDateString())
            .replace("${member.guild.name}", member.guild.name)
            .replace("${inviter.tag}", inviter.tag)
            .replace("${fetched}", fetched)
        })
      }

      var messssssage4 = messssssage
        .replace("{user}", member.user.tag)
        .replace("{guild}", member.guild.name)
        .replace("{createdat}", member.user.createdAt.toLocaleDateString())
        .replace("{membercount}", member.guild.memberCount)
        .replace("{inviter}", inviter.tag)
        .replace("{invites}", fetched)

      return client.channels.cache.get(wChan).send({ content: `${messssssage4}` });
    } catch (e) {
      let wChan = await db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.join`)
      if (!wChan) return;
      console.log(e);

      return client.channels.cache.get(wChan).send({
        content: data.event_welcomer_default
          .replace("${member.id}", member.id)
          .replace("${member.user.createdAt.toLocaleDateString()}", member.user.createdAt.toLocaleDateString())
          .replace("${member.guild.name}", member.guild.name)
      });
    }
  };

  await joinRoles(), joinDm(), blacklistFetch(), memberCount(), welcomeMessage();
};