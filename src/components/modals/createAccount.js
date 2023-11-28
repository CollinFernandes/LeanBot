const { ModalSubmitInteraction, ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionResponse } = require('discord.js');
const { Client, Enums } = require('fnbr');
const fs = require('fs').promises;
const { existsSync, readFileSync, writeFileSync } = require('fs')
let BotClient = null;
let BotAuth = null;
const ExtendedClient = require('../../class/ExtendedClient');
const config = require('../../config');

module.exports = {
    customId: 'newaccountmodal',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ModalSubmitInteraction} interaction 
     */
    run: async (client, interaction) => {
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Creating BOT...*`);
        interaction.reply({embeds: [res]})
        const filePath = `${process.cwd()}/temp/accounts/${interaction.user.id}.json`;
        const enteredAuthCode = interaction.fields.getTextInputValue('newaccountid');
        try {
            if (config.bots[buttonInteraction.user.id] == undefined) {
                BotClient = new Client({
                    "defaultStatus": "Lean Bot by FrostChanger.de",
                    "platform": "WIN",
                    "cachePresences": false,
                    "auth": {
                        "authorizationCode": enteredAuthCode,
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
                    config.bots[interaction.user.id] = BotClient;
                    BotClient.user.displayName = BotClient.user.displayName;
    
                    // Respond to the user
                    const creationSuccess = new EmbedBuilder()
                        .setColor('#4b16ff')
                        .setDescription(`*${interaction.user} | Started your BOT as \`\`${BotClient.user.displayName}\`\`*`);
                    interaction.editReply({ embeds: [creationSuccess] });
    
                    var data = null;
                    if (existsSync(`${process.cwd()}/temp/accounts/${buttonInteraction.user.id}.json`))
                        data = JSON.parse(readFileSync(`${process.cwd()}/temp/accounts/${buttonInteraction.user.id}.json`))
                    else
                        data = JSON.parse(JSON.stringify({}))
                    data[BotClient.user.displayName] = BotAuth;
                    writeFileSync(`${process.cwd()}/temp/accounts/${buttonInteraction.user.id}.json`, JSON.stringify(data, null, 2));
                });
    
                BotClient.on('deviceauth:created', (da) => {
                    BotAuth = da;
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

                var bIsMatchmaking = false;
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
                       console.log(bucketId)
                
                
                
                        // auth.missing_player_id
                
                        console.log(partyPlayerIds)
                
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
                            `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/matchmakingservice/ticket/player/${client.user.id}?${query}`,
                            {
                              headers: {
                                Accept: 'application/json',
                                Authorization: `Bearer ${token}`
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
                        const HashRequest = (
                          await axios.post(
                            "https://plebs.polynite.net/api/checksum",
                            ticket,
                            {
                              Accept: 'application/json'
                            }
                          )
                        );
                
                        if (TicketRequest.status != 200) {
                          console.log(`[${'Matchmaking'.cyan}]`, 'Error while obtaining Hash'.red);
                          BotClient.party.me.setReadiness(false);
                          return;
                        }
                
                        console.log(HashRequest)
                
                        const hash = HashRequest.data.checksum;
                
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
            } else {
                res.setDescription(`*${buttonInteraction.user} | You already have a running BOT called \`\`${config.bots[buttonInteraction.user.id].user.displayName}\`\`!*`)
                interaction.reply({embeds: [res]})
            }
        } catch (err) {
            const failLogin = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(`You entered an invalid or expired authorization code. Support: https://discord.gg/frostchanger`);
            await interaction.editReply({embeds: [failLogin]});
        }
    }
};