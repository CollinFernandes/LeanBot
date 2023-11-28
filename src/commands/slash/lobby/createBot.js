const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr');
const { fstat } = require('fs');
const fs = require('fs').promises;
const { existsSync, readFileSync, writeFileSync } = require('fs')
let BotClient = null;
let BotAuth = null;
const { allowedPlaylists, websocketHeaders } = require('../../../class/Constants');
const axios = require('axios')
const crypto = require('crypto')
const xmlparser = require('xml-parser')
const Websocket = require('ws')
var os = require('os');
var HttpsProxyAgent = require('https-proxy-agent');


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
                                            "xmppDebug": false,
                                            "cachePresences": false,
                                            "auth": {
                                                "deviceAuth": auth,
                                            },
                                            "partyConfig": {
                                                "privacy": Enums.PartyPrivacy.PRIVATE,
                                                "joinConfirmation": false,
                                                "joinability": "INVITE_AND_FORMER",
                                                "maxSize": 4,
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

                                        BotClient.on('party:joinrequest', async (req) => {
                                            res.setDescription(`*${buttonInteraction.user} | join request from \`\`${req.sender.displayName}\`\`*`)
                                            const accept = new ButtonBuilder()
                                            .setCustomId('acceptrinv')
                                            .setLabel('Accept')
                                            .setStyle(ButtonStyle.Success)
                            
                                            const decline = new ButtonBuilder()
                                            .setCustomId('declinerinv')
                                            .setLabel('Decline')
                                            .setStyle(ButtonStyle.Danger)
                            
                                            const components = new ActionRowBuilder()
                                            .addComponents(accept, decline);
                            
                                            const collector = (await reply).createMessageComponentCollector({ componentType: ComponentType.Button });
                                            collector.on('collect', async (interaction1) => {
                                                if (interaction1.customId == 'acceptrinv') {
                                                    req.accept();
                                                    res.setDescription(`*${interaction1.user} | accepted \`\`${req.sender.displayName}\`\`'s join request*`)
                                                    interaction1.reply({embeds: [res], ephemeral: true})
                                                } else if (interaction1.customId == 'declinerinv') {
                                                    req.decline();
                                                    res.setDescription(`*${interaction1.user} | declined \`\`${req.sender.displayName}\`\`'s join request*`)
                                                    interaction1.reply({embeds: [res], ephemeral: true})
                                                }
                                            })
                                            buttonInteraction.followUp({embeds: [res], ephemeral: true, components: [components]})
                                        })

                                        var bIsMatchmaking = false;
                                        var bLog = false;
                                        var leave_after = false;
                                        BotClient.on('party:updated', async (updated) => {

                                            switch (updated.meta.schema["Default:PartyState_s"]) {
                                              case "BattleRoyalePreloading": {
                                        
                                                var loadout = BotClient.party.me.meta.set("Default:LobbyState_j",
                                                  {
                                                    "LobbyState": {
                                                      "hasPreloadedAthena": true
                                                    }
                                                  }
                                                );
                                        
                                                await BotClient.party.me.sendPatch({
                                                  'Default:LobbyState_j': loadout,
                                                });
                                        
                                                break;
                                              }
                                        
                                              case "BattleRoyaleMatchmaking": {
                                                if (bIsMatchmaking) {
                                                  console.log('Members has started matchmaking!')
                                                  return;
                                                }
                                                bIsMatchmaking = true;
                                                if (bLog) { console.log(`[${'Matchmaking'.cyan}]`, 'Matchmaking Started') }
                                        
                                                /**
                                                 * @type {PartyMatchmakingInfo}
                                                 */
                                                const PartyMatchmakingInfo = JSON.parse(updated.meta.schema["Default:PartyMatchmakingInfo_j"]).PartyMatchmakingInfo;
                                        
                                        
                                                const playlistId = PartyMatchmakingInfo.playlistName.toLocaleLowerCase();
                                        
                                                if (!allowedPlaylists.includes(playlistId)) {
                                                  console.log("Unsupported playlist", playlistId)
                                                  BotClient.party.chat.send(`Playlist id: ${playlistId} is not a supported gamemode!`)
                                                  BotClient.party.me.setReadiness(false);
                                                  return;
                                                }
                                        
                                                var partyPlayerIds = BotClient.party.members.filter(x => x.isReady).map(x => x.id).join(',')
                                        
                                                const bucketId = `${PartyMatchmakingInfo.buildId}:${PartyMatchmakingInfo.playlistRevision}:${PartyMatchmakingInfo.regionId}:${playlistId}`
                                        
                                        
                                        
                                                // auth.missing_player_id
                                        
                                        
                                                var query = new URLSearchParams();
                                                query.append("partyPlayerIds", partyPlayerIds);
                                                query.append("player.platform", "Windows");
                                                query.append("player.option.partyId", BotClient.party.id);
                                                query.append("input.KBM", "true");
                                                query.append("player.input", "KBM");
                                                query.append("bucketId", bucketId);
                                        
                                                BotClient.party.members.filter(x => x.isReady).forEach(Member => {
                                                  const platform = Member.meta.get("Default:PlatformData_j");
                                                  if (!query.has(`party.{PlatformName}`)) {
                                                    query.append(`party.{PlatformName}`, "true")
                                                  }
                                                });
                                                const token = BotClient.auth.auths.get("fortnite").token;
                                        
                                                const TicketRequest = (
                                                  await axios.get(
                                                    `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/matchmakingservice/ticket/player/${BotClient.user.id}?${query}`,
                                                    {
                                                      headers: {
                                                        "Accept": 'application/json',
                                                        "Authorization": `Bearer ${token}`,
                                                        "User-Agent": "Fortnite/++Fortnite+Release-27.11-CL-29739262 Windows/10.0.22621.1.256.64bit",
                                                      }
                                                    }
                                                  )
                                                );
                                        
                                                if (TicketRequest.status != 200) {
                                                  console.log(`[${'Matchmaking'.cyan}]`, 'Error while obtaining ticket'.red);
                                                  BotClient.party.me.setReadiness(false);
                                                  return;
                                                }
                                        
                                                /**
                                                 * @type {MMSTicket}
                                                 */
                                                const ticket = TicketRequest.data;
                                        
                                                /**
                                                 * @type {String}
                                                 */
                                                const HashRequest = calcChecksum(ticket.payload, ticket.signature)
                                        
                                                if (TicketRequest.status != 200) {
                                                  console.log(`[${'Matchmaking'.cyan}]`, 'Error while obtaining Hash'.red);
                                                  BotClient.party.me.setReadiness(false);
                                                  return;
                                                }
                                        
                                        
                                                const hash = HashRequest;
                                        
                                                var MMSAuth = [
                                                  "Epic-Signed",
                                                  ticket.ticketType,
                                                  ticket.payload,
                                                  ticket.signature,
                                                  hash
                                                ];
                                        
                                                const matchmakingClient = new Websocket(
                                                  ticket.serviceUrl,
                                                  {
                                                    perMessageDeflate: false,
                                                    rejectUnauthorized: false,
                                                    headers: {
                                                      Origin: ticket.serviceUrl.replace('ws', 'http'),
                                                      Authorization: MMSAuth.join(" "),
                                                      ...websocketHeaders
                                                    }
                                                  }
                                                );
                                        
                                                matchmakingClient.on('unexpected-response', (request, response) => {
                                                  let data = '';
                                                  response.on('data', (chunk) => data += chunk);
                                        
                                                  response.on('end', () => {
                                                    const baseMessage = `[MATCHMAKING] Error Error while connecting to matchmaking service: (status ${response.statusCode} ${response.statusMessage})`;
                                        
                                                    BotClient.party.chat.send(`Error while connecting to matchmaking service: (status ${response.statusCode} ${response.statusMessage})`)
                                        
                                                    if (data == '') {
                                                      console.error(baseMessage);
                                        
                                                    }
                                        
                                                    else if (response.headers['content-type'].startsWith('application/json')) {
                                        
                                                      const jsonData = JSON.parse(data);
                                        
                                                      if (jsonData.errorCode) {
                                        
                                                        console.error(`${baseMessage}, ${jsonData.errorCode} ${jsonData.errorMessage || ''}`);
                                                        BotClient.party.chat.send(`Error while connecting to matchmaking service: ${jsonData.errorCode} ${jsonData.errorMessage || ''}`)
                                        
                                                      } else {
                                                        console.error(`${baseMessage} response body: ${data}`)
                                                      }
                                        
                                                    }
                                        
                                                    else if (response.headers['x-epic-error-name']) {
                                        
                                                      console.error(`${baseMessage}, ${response.headers['x-epic-error-name']} response body: ${data}`);
                                        
                                                    }
                                        
                                                    else if (response.headers['content-type'].startsWith('text/html')) {
                                                      const parsed = xmlparser(data);
                                        
                                                      if (parsed.root) {
                                        
                                                        try {
                                        
                                                          const title = parsed.root.children.find(x => x.name == 'head').children.find(x => x.name == 'title');
                                        
                                                          console.error(`${baseMessage} HTML title: ${title}`)
                                        
                                                        } catch { console.error(`${baseMessage} HTML response body: ${data}`) }
                                        
                                                      }
                                        
                                                      else { console.error(`${baseMessage} HTML response body: ${data}`) }
                                                    }
                                        
                                                    else { console.error(`${baseMessage} response body: ${data}`) }
                                                  })
                                                })
                                        
                                                if (bLog) {
                                                  matchmakingClient.on('close', function () {
                                                    console.log(`[${'Matchmaking'.cyan}]`, 'Connection to the matchmaker closed')
                                                    
                                                  });
                                                }
                                                
                                                matchmakingClient.on('message', (msg) => {
                                                  const message = JSON.parse(msg);
                                                  if (bLog) {
                                                    console.log(`[${'Matchmaking'.cyan}]`, 'Message from the matchmaker', message)
                                                  }
                                        
                                                  if (message.name === 'Error') {
                                                    bIsMatchmaking = false;
                                                  }
                                                });
                                        
                                                break;
                                              }
                                        
                                              case "BattleRoyalePostMatchmaking": {
                                                if (bLog) { console.log(`[${'Party'.magenta}]`, 'Players entered loading screen, Exiting party...') }
                                        
                                                if (client.party?.me?.isReady) {
                                                  BotClient.party.me.setReadiness(false)
                                                }
                                                bIsMatchmaking = false;
                                                if (leave_after === true) {
                                                BotClient.party.leave();
                                                break;
                                                } else {
                                                  if (leave_after == false) {
                                                    async function timeexpire() {
                                                    BotClient.party.chat.send("Time expired!")
                                                    await sleep(1.2)
                                                    BotClient.party.leave()
                                                    console.log("[PARTY] Left party due to party time expiring!")
                                                    console.log("[PARTY] Time tracking stoped!")
                                                    timerstatus = false
                                                }
                                                    this.ID = setTimeout(timeexpire, 3600000)
                                                    break;
                                                  }
                                                }
                                              }
                                        
                                              case "BattleRoyaleView": {
                                                break;
                                              }
                                        
                                              default: {
                                                if (bLog) { console.log(`[${'Party'.magenta}]`, 'Unknow PartyState'.yellow, updated.meta.schema["Default:PartyState_s"]) }
                                                break;
                                              }
                                            }
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

function calcChecksum(payload, signature) {
    const token = "Don'tMessWithMMS";
    const plaintext =
      payload.slice(10, 20) + token + signature.slice(2, 10);
    const data = Buffer.from(plaintext, 'utf16le');
    const hashObject = crypto.createHash('sha1');
    const hashDigest = hashObject.update(data).digest();
    return Buffer.from(hashDigest.subarray(2, 10)).toString('hex').toUpperCase();
  }