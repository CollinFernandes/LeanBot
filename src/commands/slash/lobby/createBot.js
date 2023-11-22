const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('manage your lean bot')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
            .setDescription('Create your Lean Lobby Bot')
            .addStringOption(option => 
                option.setName('authcode')
                .setDescription('AuthCode of your Account (/getauth if you dont have)')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('skin')
            .setDescription('Change the Skin of your BOT')
            .addStringOption(option => 
                option.setName('skin')
                .setDescription('Skin Name or CID')
                .setRequired(true))),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        var authCode = options.getString('authcode');
        var BotClient = new Client();
        if (authCode != undefined) {
            if (authCode.includes('?code=')) {
                authCode = authCode.split('=')[1].split('"')[0];
            } else {
                authCode = authCode;
            }
            BotClient = new Client({
                "defaultStatus": "Bot",
                "platform": "WIN",
                "cachePresences": false,
                "auth": {
                    "authorizationCode": authCode,
                },
                "partyConfig": {
                    "privacy": Enums.PartyPrivacy.PRIVATE,
                    "joinConfirmation": false,
                    "joinability": "INVITE_AND_FORMER",
                    "maxSize": 16,
                    "chatEnabled": true
              },
                "debug": false
            })
        }
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`${interaction.user} | Creating BOT...`);
        if (interaction.options.getSubcommand() === "create") {
            const reply = interaction.reply({embeds: [res]})
            try {
                BotClient.auth.authorizationCode = authCode
                BotClient.on('ready', async () => {
                    res.setDescription(`*${interaction.user} | Started your BOT as \`\`${BotClient.user.displayName}\`\`*`)
                    interaction.editReply({embeds: [res]})
                })
    
                BotClient.on('friend:request', async (req) => {
                    res.setDescription(`*${interaction.user} | friend request from \`\`${req.displayName}\`\`*`)
                    const accept = new ButtonBuilder()
                    .setCustomId('acceptfreq')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success)
    
                    const decline = new ButtonBuilder()
                    .setCustomId('declinefreq')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
    
                    const components = new ActionRowBuilder()
                    .addComponents(accept, decline);
    
                    const collector = (await reply).createMessageComponentCollector({ componentType: ComponentType.Button });
                    collector.on('collect', async (interaction1) => {
                        if (interaction1.customId == 'acceptfreq') {
                            req.accept();
                            res.setDescription(`*${interaction1.user} | accepted \`\`${req.displayName}\`\`'s friend request*`)
                            interaction1.reply({embeds: [res], ephemeral: true})
                        } else if (interaction1.customId == 'declinefreq') {
                            req.decline();
                            res.setDescription(`*${interaction1.user} | declined \`\`${req.displayName}\`\`'s friend request*`)
                            interaction1.reply({embeds: [res], ephemeral: true})
                        }
                    })
                    interaction.followUp({embeds: [res], ephemeral: true, components: [components]})
                })
    
                BotClient.on('party:invite', async (req) => {
                    res.setDescription(`*${interaction.user} | party invite from \`\`${req.sender.displayName}\`\`*`)
                    const accept = new ButtonBuilder()
                    .setCustomId('acceptpinv')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success)
    
                    const decline = new ButtonBuilder()
                    .setCustomId('declinepinv')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
    
                    const components = new ActionRowBuilder()
                    .addComponents(accept, decline);
    
                    const collector = (await reply).createMessageComponentCollector({ componentType: ComponentType.Button });
                    collector.on('collect', async (interaction1) => {
                        if (interaction1.customId == 'acceptpinv') {
                            req.accept();
                            res.setDescription(`*${interaction1.user} | accepted \`\`${req.sender.displayName}\`\`'s party invite*`)
                            interaction1.reply({embeds: [res], ephemeral: true})
                        } else if (interaction1.customId == 'declinepinv') {
                            req.decline();
                            res.setDescription(`*${interaction1.user} | declined \`\`${req.sender.displayName}\`\`'s party invite*`)
                            interaction1.reply({embeds: [res], ephemeral: true})
                        }
                    })
                    interaction.followUp({embeds: [res], ephemeral: true, components: [components]})
                })

                await BotClient.login();
            } catch(err) {
                const failLogin = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle(`${config.emojis.wrong} You entered an invalid or expired authorization code. Support: https://discord.gg/frostchanger`);
                await interaction.reply({embeds: [failLogin]});
            }
        } else if (interaction.options.getSubcommand() === "skin") {
            var skinId = options.getString('skin');
            
            console.log(BotClient)
            await BotClient.party.me.setOutfit(skinId)
            res.setDescription(`*${interaction1.user} | set skin to \`\`${skinId}\`\`*`)
            interaction.reply({embeds: [res], ephemeral: true})
        }
    }
};