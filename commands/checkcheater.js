const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkcheater')
        .setDescription('[ADMIN] Detects suspicious players based on advanced game statistics.')
        .addStringOption(option => option.setName('steam_id').setDescription('Steam ID of the player to check.').setRequired(false)),
        
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === config.requiredRoleId)) {
            await interaction.reply({ content: "⛔ You do not have permission to use this command.", ephemeral: true });
            return;
        }

        const steamIdInput = interaction.options.getString('steam_id');
        if (steamIdInput) {
            const specificPlayerStats = await getPlayerStatsBySteamId(steamIdInput);
            if (specificPlayerStats) {
                const embed = generatePlayerEmbed(specificPlayerStats);
                await interaction.reply({ embeds: [embed], ephemeral: false });
            } else {
                await interaction.reply({ content: "No data found for the provided Steam ID.", ephemeral: false });
            }
        } else {
            const players = await getPlayersStats();
            if (players.length === 0) {
                await interaction.reply({ content: "No suspicious players found.", ephemeral: false });
                return;
            }
            await interaction.reply({ content: `🔍 **Suspicious players detected:** ${players.length}`, ephemeral: false });
            players.forEach(async (player) => {
                const playerEmbed = generatePlayerEmbed(player);
                await interaction.followUp({ embeds: [playerEmbed], ephemeral: false });
            });
        }
    }
};

async function getPlayersStats() {
    const connection = await mysql.createConnection(config.dbConfig);
    const query = `SELECT steam_id, name, lastseen, kills, deaths, assists, headshots, shoots, hits_given, ROUND((headshots / kills * 100), 2) AS hs_percent, ROUND((hits_given / shoots * 100), 2) AS accuracy_percent, ROUND((kills / deaths), 2) as kd_ratio FROM k4stats WHERE kills > 30 AND (headshots / kills * 100) > 75 AND (kills / deaths) > 1.5 AND (hits_given / shoots * 100) > 15 ORDER BY hs_percent DESC, accuracy_percent DESC, kd_ratio DESC LIMIT 50;`;
    const [players] = await connection.execute(query);
    await connection.end();
    return players.map(player => ({ ...player, cheatProbability: calculateCheatProbability(player) }));
}

async function getPlayerStatsBySteamId(steamId) {
    const connection = await mysql.createConnection(config.dbConfig);
    const query = `SELECT steam_id, name, lastseen, kills, deaths, assists, headshots, shoots, hits_given, ROUND((headshots / kills * 100), 2) AS hs_percent, ROUND((hits_given / shoots * 100), 2) AS accuracy_percent, ROUND((kills / deaths), 2) as kd_ratio FROM k4stats WHERE steam_id = ?;`;
    const [players] = await connection.execute(query, [steamId]);
    await connection.end();
    if (players.length > 0) {
        return { ...players[0], cheatProbability: calculateCheatProbability(players[0]) };
    } else {
        return null;
    }
}

function calculateCheatProbability(player) {

    let cheatProbabilityPlayer = 0;

    if (player.hs_percent >= 100) {
        cheatProbabilityPlayer += 150;
    } else if (player.hs_percent >= 90) {
        cheatProbabilityPlayer += 85;
    } else if (player.hs_percent >= 80) {
        cheatProbabilityPlayer += 70;
    } else if (player.hs_percent >= 60) {
        cheatProbabilityPlayer += 15;
    } else if (player.hs_percent >= 40) {
        cheatProbabilityPlayer += 10;
    } else if (player.hs_percent >= 20) {
        cheatProbabilityPlayer += 5;
    } else if (player.hs_percent <= 5) {
        cheatProbabilityPlayer -= 10;
    }

    if (player.accuracy_percent >= 100) {
        cheatProbabilityPlayer *= 2.0;
    } else if (player.accuracy_percent >= 50) {
        cheatProbabilityPlayer *= 1.5;
    }  else if (player.accuracy_percent >= 30) {
        cheatProbabilityPlayer *= 1.1;
    }  else if (player.accuracy_percent >= 20) {
        cheatProbabilityPlayer *= 0.9;
    } else if (player.accuracy_percent >= 10) {
        cheatProbabilityPlayer *= 0.5;
    }  else if (player.accuracy_percent < 10) {
        cheatProbabilityPlayer *= 0.01;
    } 

    if (player.kills >= 500) {
        cheatProbabilityPlayer *= 2.5;
    }
    else if (player.kills > 250) {
        cheatProbabilityPlayer *= 1.1;
    } else if (player.kills > 100) {
        cheatProbabilityPlayer *= 1.0;
    } else if (player.kills > 50) {
        cheatProbabilityPlayer *= 0.65;
    } else if (player.kills > 25) {
        cheatProbabilityPlayer *= 0.45;
    } else if (player.kills > 10) {
        cheatProbabilityPlayer *= 0.02;
    } else if (player.kills > 1) {
        cheatProbabilityPlayer *= 0.00001;
    }

    if (player.kd_ratio > 3.0) {
        cheatProbabilityPlayer *= 1.5;
    } 
    else if (player.kd_ratio > 2.0) {
        cheatProbabilityPlayer *= 1.01;
    } 
    else if (player.kd_ratio > 1.50) {
        cheatProbabilityPlayer *= 1.001;
    } 
    else if (player.kd_ratio > 1.0) {
        cheatProbabilityPlayer *= 0.085;
    } 
    else if (player.kd_ratio > 0.75) {
        cheatProbabilityPlayer *= 0.065;
    } 
    else if (player.kd_ratio > 0.40) {
        cheatProbabilityPlayer *= 0.045;
    } 
    else if (player.kd_ratio > 0.10) {
        cheatProbabilityPlayer *= 0.02;
    } 
    else if (player.kd_ratio > 0.00) {
        cheatProbabilityPlayer *= 0.01;
    } 
    return (cheatProbabilityPlayer).toFixed(3);
}


function generatePlayerEmbed(player) {
    const embed = new EmbedBuilder()
        .setColor('#FF5555')
        .setTitle(`🚨 **Suspect Name:** ${player.name}`)
        .addFields(
            {
                name: '💀 **Total Kills**',
                value: `${player.kills}`,
                inline: true
            }, {
                name: '🤝 **Assists**',
                value: `${player.assists}`,
                inline: true
            }, {
                name: '☠️ **Total Deaths**',
                value: `${player.deaths}`,
                inline: true
            },
            {
                name: '🔫 **Accuracy %**',
                value: `${player.accuracy_percent}%`,
                inline: true
            }, {
                name: '🎯 **Headshots %**',
                value: `${player.hs_percent}%`,
                inline: true
            }, {
                name: '🔥 **K/D Ratio**',
                value: `${player.kd_ratio}`,
                inline: true
            },
            {
                name: '🔪 **Hits Given**',
                value: `${player.hits_given}`,
                inline: true
            }, {
                name: '🎯 **Headshots**',
                value: `${player.headshots}`,
                inline: true
            }, {
                name: '⚔️ **Total Shoots**',
                value: `${player.shoots}`,
                inline: true
            },
            {
                name: '💡 **Cheat Probability**',
                value: `${player.cheatProbability}%`,
                inline: true
            }, {
                name: '👤 **Steam ID**',
                value: `${player.steam_id}`,
                inline: true
            }
        )
        .setFooter({ text: `Last Seen: ${player.lastseen}` });
    return embed;
}



