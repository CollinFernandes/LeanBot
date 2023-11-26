const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setemote')
        .setDescription('Set the Emote of your BOT!')
        .addStringOption(option => option.setName('emoteid')
        .setDescription('Id or Name of the Emote')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('emoteid')
        const skin = await FindCosmeticByType(config.cosmetics, skinId, "emote")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set emote to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a emote named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        console.log(skin.id)
        bot.party.me.setEmote(skin.id, `FortniteGame/Plugins/GameFeatures/BRCosmetics/Content/Athena/Items/Cosmetics/Dances`);
        interaction.reply({embeds: [res]})
    }
};