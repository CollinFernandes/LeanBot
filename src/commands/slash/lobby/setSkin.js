const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr');
const { FindCosmetic } = require('../../../class/Utils');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setskin')
        .setDescription('Set the Skin of your BOT!')
        .addStringOption(option => option.setName('skinid')
        .setDescription('Id of the Skin')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('skinid')
        const skin = await FindCosmetic(config.cosmetics, skinId, "outfit")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set skin to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a skin named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        await bot.party.me.setOutfit(skin.id);
        interaction.reply({embeds: [res]})
    }
};