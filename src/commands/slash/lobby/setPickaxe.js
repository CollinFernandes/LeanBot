const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setpickaxe')
        .setDescription('Set the Pickaxe of your BOT!')
        .addStringOption(option => option.setName('pickaxe')
        .setDescription('Id or Name of the Pickaxe!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('pickaxe')
        const skin = await FindCosmetic(config.cosmetics, skinId, "pickaxe")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set pickaxe to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a pickaxe named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setPickaxe(skin.id);
        interaction.reply({embeds: [res]})
    }
};