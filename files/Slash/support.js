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
    name: 'support',
    description: 'Give a roles when guild\'s member have something about your server on them bio',
    options: [
        {
            name: 'action',
            type: ApplicationCommandOptionType.String,
            description: 'Choose the action',
            required: true,
            choices: [
                {
                    name: "POWER ON",
                    value: "true"
                },
                {
                    name: "POWER OFF",
                    value: "false"
                }
            ]
        },
        {
            name: 'input',
            type: ApplicationCommandOptionType.String,
            description: 'Choose the keywords wanted in the bio',
            required: false,
        },
        {
            name: 'roles',
            type: ApplicationCommandOptionType.Role,
            description: 'The wanted roles to give for your member',
            required: false,
        }
    ],

    run: async (client, interaction) => {
        let fileContents = fs.readFileSync(`${process.cwd()}/files/lang/${await getLanguage(interaction.guild.id)}.yml`, 'utf-8');
        let data = yaml.load(fileContents);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: data.support_not_admin });
        }

        const { QuickDB } = require("quick.db");
        const db = new QuickDB();

        let action = interaction.options.getString("action");
        let input = interaction.options.getString("input");
        let roles = interaction.options.getRole("roles")

        if (action == "true") {
            await db.set(`${interaction.guild.id}.GUILD.SUPPORT`,
                {
                    input: input,
                    rolesId: roles.id,
                    state: action
                });

            interaction.reply({
                content: data.support_command_work
                    .replace("${interaction.guild.name}", interaction.guild.name)
                    .replace("${input}", input)
                    .replace("${roles.id}", roles.id)
            })

        } else {
            await db.delete(`${interaction.guild.id}.GUILD.SUPPORT`);
            interaction.reply({
                content: data.support_command_work_on_disable
                    .replace("${interaction.guild.name}", interaction.guild.name)
            })
        };
    }
}