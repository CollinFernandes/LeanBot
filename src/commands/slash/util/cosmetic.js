const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('cosmetic')
        .setDescription('get Information about the mentioned cosmetic via API!')
        .addStringOption(option => option.setName('cosmetic')
        .setDescription('Name of the cosmetic you want info from.')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const cosmetic = options.getString('cosmetic')
        const cosmeticInfo = await FindCosmetic(config.cosmetics, cosmetic)
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Cosmetic info of \`\`${cosmetic}\`\`*`);
        if (!cosmeticInfo) {
            res.setDescription(`*Could not find a emote named \`\`${cosmetic}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var set = "Not in any Set."
        if (cosmeticInfo.set) {
            set = cosmeticInfo.set.text
        }

        var showcaseVideo = "No showcase Video available."
        if (cosmeticInfo.showcaseVideo) {
            showcaseVideo = `https://youtu.be/${cosmeticInfo.showcaseVideo}`
        }

        res.addFields(
            { name: 'Name', value: `\`\`\`${cosmeticInfo.name}\`\`\``, inline: true },
            { name: 'Description', value: `\`\`\`${cosmeticInfo.description}\`\`\``, inline: true },
            { name: 'ID', value: `\`\`\`${cosmeticInfo.id}\`\`\``, inline: true },
            { name: 'Type', value: `\`\`\`${cosmeticInfo.type.displayValue} (${cosmeticInfo.type.value})\`\`\``, inline: true },
            { name: 'Rarity', value: `\`\`\`${cosmeticInfo.rarity.displayValue} (${cosmeticInfo.rarity.value})\`\`\``, inline: true },
            { name: 'Set', value: `\`\`\`${set}\`\`\``, inline: true },
            { name: 'Introduced in', value: `\`\`\`${cosmeticInfo.introduction.text}\`\`\``, inline: false },
            { name: 'Game Path', value: `\`\`\`${cosmeticInfo.path}\`\`\``, inline: true },
            { name: 'Preview Video', value: `${showcaseVideo}`, inline: false },
        );
        interaction.reply({embeds: [res]})
    }
};