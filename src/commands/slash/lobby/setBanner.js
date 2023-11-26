const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Set the Banner of your BOT!')
        .addStringOption(option => option.setName('banner')
        .setDescription('Id or Name of the Banner!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('banner')
        const skin = await FindCosmeticByType(config.cosmetics, skinId, "banner")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set banner to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a banner named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setBanner(skin.id);
        interaction.reply({embeds: [res]})
    }
};