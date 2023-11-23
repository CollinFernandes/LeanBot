const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr');
const { fstat } = require('fs');
const fs = require('fs').promises;
const { existsSync, readFileSync, writeFileSync } = require('fs')
let BotClient = null;
let BotAuth = null;

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('manage your lean bot')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
            .setDescription('Create your Lean Lobby Bot'))
        .addSubcommand(subcommand =>
            subcommand.setName('status')
            .setDescription('Check the status of your Lean Lobby Bot')),
                
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        var reply = null;
        const { options, channel } = interaction;
        var authCode = options.getString('authcode');
        if (authCode != undefined) 
        {
            if (authCode.includes('?code=')) {
                authCode = authCode.split('=')[1].split('"')[0];
            } else {
                authCode = authCode;
            }
            BotClient = new Client({
                "defaultStatus": "Lean Bot by FrostChanger.de",
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
        if (interaction.options.getSubcommand() === "create") 
        {
            const filePath = `${process.cwd()}/temp/accounts/${interaction.user.id}.json`;
            try
            {
                let data = await fs.readFile(filePath, 'utf8'); 
                data = JSON.parse(data);

                const accountsRes = new EmbedBuilder()
                    .setColor('#4b16ff')
                    .setDescription(`*${interaction.user} | You already have some accounts stored! Select one if you want. If not, click on the Button 'Add Another'.*`);

                const components = new ActionRowBuilder();
                for (var account in data) {
                    const component = new ButtonBuilder()
                        .setCustomId(`${data[account].accountId}`)
                        .setLabel(`${account}`)
                        .setStyle(ButtonStyle.Success);

                    components.addComponents(component);
                }

                const newAcc = new ButtonBuilder()
                    .setCustomId(`newaccount`)
                    .setLabel(`Add Another`)
                    .setStyle(ButtonStyle.Secondary);

                components.addComponents(newAcc);

                reply = await interaction.reply({ embeds: [accountsRes], components: [components] });
                const collector = (await reply).createMessageComponentCollector({ componentType: ComponentType.Button });
                
                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'newaccount') {
                        const modal = new ModalBuilder()
                        .setCustomId('newaccountmodal')
                        .setTitle('new Account.');

                        const authCode = new TextInputBuilder()
                        .setCustomId('newaccountid')
                        .setLabel("your Auth Code.")
                        .setStyle(TextInputStyle.Short);

                        const authCodeBuilder = new ActionRowBuilder().addComponents(authCode);
                        modal.addComponents(authCodeBuilder);
                        const modalResponse = await buttonInteraction.showModal(modal);
                    } else {
                        let data = await fs.readFile(filePath, 'utf8'); 
                        data = JSON.parse(data);
                        for(var account in data) {
                            if (data[account].accountId === buttonInteraction.customId) {
                                var res = new EmbedBuilder()
                                .setColor('#4b16ff')
                                .setDescription(`*${interaction.user} | Creating BOT...*`);
                                if (config.bots[buttonInteraction.user.id] == undefined) {
                                    buttonInteraction.reply({embeds: [res]})
                                    let auth = {
                                        accountId: data[account].accountId,
                                        deviceId: data[account].deviceId,
                                        secret: data[account].secret
                                    }
                                    try {
                                        BotClient = new Client({
                                            "defaultStatus": "Lean Bot by FrostChanger.de",
                                            "platform": "WIN",
                                            "cachePresences": false,
                                            "auth": {
                                                "deviceAuth": auth,
                                            },
                                            "partyConfig": {
                                                "privacy": Enums.PartyPrivacy.PRIVATE,
                                                "joinConfirmation": false,
                                                "joinability": "INVITE_AND_FORMER",
                                                "maxSize": 16,
                                                "chatEnabled": true
                                            },
                                            "debug": false
                                        });

                                        BotClient.on('ready', async () => {
                                            BotClient.isReady = true;
                                            config.bots[buttonInteraction.user.id] = BotClient;
                                            BotClient.user.displayName = BotClient.user.displayName;
                            
                                            // Respond to the user
                                            const creationSuccess = new EmbedBuilder()
                                                .setColor('#4b16ff')
                                                .setDescription(`*${buttonInteraction.user} | Started your BOT as \`\`${BotClient.user.displayName}\`\`*`);
                                            buttonInteraction.editReply({ embeds: [creationSuccess] });
                                        });
                            
                                        BotClient.on('friend:request', async (req) => {
                                            res.setDescription(`*${buttonInteraction.user} | friend request from \`\`${req.displayName}\`\`*`)
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
                                            buttonInteraction.followUp({embeds: [res], ephemeral: true, components: [components]})
                                        })
                            
                                        BotClient.on('party:invite', async (req) => {
                                            res.setDescription(`*${buttonInteraction.user} | party invite from \`\`${req.sender.displayName}\`\`*`)
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
                                            buttonInteraction.followUp({embeds: [res], ephemeral: true, components: [components]})
                                        })
                            
                                        BotClient.login();
                                    } catch (err) {
                                        console.log(err)
                                    }
                                } else {
                                    res.setDescription(`*${buttonInteraction.user} | You already have a running BOT called \`\`${config.bots[buttonInteraction.user.id].user.displayName}\`\`!*`)
                                    buttonInteraction.reply({embeds: [res]})
                                }
                            }
                        }
                    }
                })
                
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    const modal = new ModalBuilder()
                    .setCustomId('newaccountmodal')
                    .setTitle('new Account.');

                    const authCode = new TextInputBuilder()
                    .setCustomId('newaccountid')
                    .setLabel("your Auth Code.")
                    .setStyle(TextInputStyle.Short);

                    const authCodeBuilder = new ActionRowBuilder().addComponents(authCode);
                    modal.addComponents(authCodeBuilder);
                    await interaction.showModal(modal);
                } 
                else 
                {
                    console.error("Error reading or parsing the accounts file:", error);
                    await interaction.reply({ content: "An error occurred while processing your request. Please try again.", ephemeral: true });
                }
            }
        }
        
        if (interaction.options.getSubcommand() === "status") {
            const res = new EmbedBuilder().setColor('#4b16ff');

            // Check if BotClient is defined and ready
            if (BotClient && BotClient.isReady) {
                const userStatus = BotClient.user ? `Logged in as ${BotClient.user.displayName}` : 'User not set';
                res.setDescription(`*Bot Status: Ready*\n${userStatus}`);
            } else {
                res.setDescription('*Bot Status: Not Ready*');
            }

            await interaction.reply({ embeds: [res], ephemeral: true });
        }
    }
};