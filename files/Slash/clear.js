const {
    Client,
    Intents,
    Collection,
    EmbedBuilder,
    Permissions,
    ApplicationCommandType,
    PermissionsBitField,
    ApplicationCommandOptionType
} = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear x number of message in a channels !',
    options: [
        {
            name: 'number',
            type: ApplicationCommandOptionType.Number,
            description: 'The number of message you want to delete !',
            required: true
        }
    ],
    run: async (client, interaction) => {

        const permission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
        var numberx = interaction.options.getNumber("number") + 1
        if (!permission) return interaction.reply({ content: "❌ | You don't have permission `MANAGE_MESSAGES`." });
        if (!numberx) { return message.channel.send(`You must specify a number of messages to delete!`); }
        if (numberx > 100) { return interaction.reply({ content: "❌ | I can't delete more than 100 message in one time !" }) }
        else if (isNaN(numberx)) { return interaction.reply({ content: `You must specify a number of messages to delete!` }); }
        interaction.channel.bulkDelete(numberx, true)
            .then((messages) => {
                interaction.channel
                    .send(`${messages.size} messages deleted !`)
                    .then((sent) => {
                        setTimeout(() => {
                            sent.delete();
                        }, 3500);
                        interaction.reply({ content: `${messages.size} message are been deleted !`, ephemeral: true })
                    })

                try {
                    logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle("Clear Message Logs")
                        .setDescription(`<@${interaction.user.id}> clear ${messages.size} messages in <#${interaction.channel.id}>`)

                    let logchannel = interaction.guild.channels.cache.find(channel => channel.name === 'ihorizon-logs');
                    if (logchannel) { logchannel.send({ embeds: [logEmbed] }) }
                } catch (e) { console.error(e) };
            });
        const filter = (interaction) => interaction.user.id === interaction.member.id;
    }
}
