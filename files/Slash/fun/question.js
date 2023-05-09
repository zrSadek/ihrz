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

const yaml = require('js-yaml'), fs = require('fs');
const getLanguage = require(`${process.cwd()}/files/lang/getLanguage`);

module.exports = {
  name: 'question',
  description: 'give a question to the bot',
  options: [
    {
      name: 'question',
      type: ApplicationCommandOptionType.String,
      description: 'The question you want to give for the bot',
      required: true
    }
  ],
  run: async (client, interaction, message) => {
    let fileContents = fs.readFileSync(`${process.cwd()}/files/lang/${await getLanguage(interaction.guild.id)}.yml`, 'utf-8');
    let data = yaml.load(fileContents);

    let question = interaction.options.getString("question")

    let text = question.split(" ");

    if (!text[2]) return interaction.reply({ content: data.question_not_full });

    let reponse = data.question_s
    let result = Math.floor((Math.random() * reponse.length));

    const embed = new EmbedBuilder()
      .setTitle(data.question_embed_title
        .replace(/\${interaction\.user\.username}/g, interaction.user.username)
      )
      .setColor("#ddd98b")
      .addFields({ name: data.question_fields_input_embed, value: question, inline: true },
        { name: data.question_fields_output_embed, value: reponse[result] })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}