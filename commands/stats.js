const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 


module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('[ADMIN] Displays the statistics of a specified player based on their Steam ID.')
    .addStringOption(option =>
      option.setName('steam_id')
        .setDescription('The Steam ID of the player to display statistics for.')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.requiredRoleId)) {
        await interaction.reply({ content: "⛔ You do not have permission to use this command.", ephemeral: true });
        return;
      }
    const steamId = interaction.options.getString('steam_id');

    try {
        const connection = await mysql.createConnection(config.dbConfig);

     
      const statsQuery = 'SELECT * FROM k4stats WHERE steam_id = ?';
      const [statsRows] = await connection.execute(statsQuery, [steamId]);

      if (statsRows.length === 0) {
        await interaction.reply({ content: "No statistics found for the provided Steam ID.", ephemeral: false });
        await connection.end();
        return;
      }

      const playerStats = statsRows[0];


      const embed = new EmbedBuilder()
        .setTitle(`**${playerStats.name} Statistics**`)
        .setDescription(`👤 **Steam ID** ${playerStats.steam_id}`)
        .addFields(
          { name: '💀 **Total Kills**', value: `${playerStats.kills}`, inline: true },
          { name: '☠️ **Total Deaths**', value: `${playerStats.deaths}`, inline: true },
          { name: '🤝 **Assists**', value: `${playerStats.assists}`, inline: true },
          { name: '🔥 **K/D Ratio**', value: `${(playerStats.kills / playerStats.deaths).toFixed(2)}`, inline: true },
          { name: '🎯 **Headshots**', value: `${playerStats.headshots}`, inline: true },
          { name: '🎯 **Headshots %**', value: `${(playerStats.headshots / playerStats.kills * 100).toFixed(2)}%`, inline: true },
          { name: '🔫 **Accuracy %**', value: `${(playerStats.hits_given / playerStats.shoots * 100).toFixed(2)}%`, inline: true },
          { name: '⚔️ **Total Shoots**', value: `${playerStats.shoots}`, inline: true },
          { name: '🔪 **Hits Given**', value: `${playerStats.hits_given}`, inline: true },
          { name: '🛡️ **Hits Taken**', value: `${playerStats.hits_taken}`, inline: true },
          { name: '🏆 **Round Win / Lose**', value: `${playerStats.round_win} / ${playerStats.round_lose}`, inline: true },
          { name: '⚖️ **W/L Ratio**', value: `${(playerStats.round_win / (playerStats.round_win + playerStats.round_lose) * 100).toFixed(2)}%`, inline: true },
      )
  
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while fetching the statistics. Please try again later.", ephemeral: false });
    }
  }
};
