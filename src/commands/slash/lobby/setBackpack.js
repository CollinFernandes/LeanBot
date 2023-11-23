const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setbackpack')
        .setDescription('Set the Backpack of your BOT!')
        .addStringOption(option => option.setName('backpack')
        .setDescription('Id or Name of the Backpack!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('backpack')
        const skin = await FindCosmetic(config.cosmetics, skinId, "backpack")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set backpack to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a backpack named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setBackpack(skin.id);
        interaction.reply({embeds: [res]})
    }
};