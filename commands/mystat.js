const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mystat')
    .setDescription('Displays your statistics.'),
  async execute(interaction, client) {
    const userId = interaction.user.id;

    try {
      const connection = await mysql.createConnection(config.dbConfig);
      const query = 'SELECT steam_id FROM user_discord WHERE discord_id = ?';
      const [rows] = await connection.execute(query, [userId]);

      if (rows.length === 0) {
        await interaction.reply({ content: "Your Steam ID is not found in the database. 🕵️‍♂️", ephemeral: false });
        await connection.end();
        return;
      }

      const steamId = rows[0].steam_id;
      const statsQuery = 'SELECT * FROM k4stats WHERE steam_id = ?';
      const [statsRows] = await connection.execute(statsQuery, [steamId]);

      if (statsRows.length === 0) {
        await interaction.reply({ content: "No statistics found for your Steam ID. 📉", ephemeral: false });
        await connection.end();
        return;
      }
      const userStats = statsRows[0];
      const timeQuery = 'SELECT * FROM k4times WHERE steam_id = ?';
      const [timeRows] = await connection.execute(timeQuery, [steamId]);

      let totalTimePlayed = "Data not available 🚫";
      if (timeRows.length > 0) {
        const totalSeconds = timeRows[0].all;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        totalTimePlayed = `${hours} hours and ${minutes} minutes`;
      }
      const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📊 **__Your Statistics__** 📊')
      .setDescription(` `)
      .addFields(
        { name: '💀 **Total Kills**', value: `${userStats.kills}`, inline: true },
        { name: '☠️ **Total Deaths**', value: `${userStats.deaths}`, inline: true },
        { name: '🤝 **Assists**', value: `${userStats.assists}`, inline: true },
        { name: '🔥 **K/D Ratio**', value: `${(userStats.kills / userStats.deaths).toFixed(2)}`, inline: true },
        { name: '🎯 **Headshots**', value: `${userStats.headshots}`, inline: true },
        { name: '🎯 **Headshots %**', value: `${(userStats.headshots / userStats.kills * 100).toFixed(2)}%`, inline: true },
        { name: '🔫 **Accuracy %**', value: `${(userStats.hits_given / userStats.shoots * 100).toFixed(2)}%`, inline: true },
        { name: '⚔️ **Total Shoots**', value: `${userStats.shoots}`, inline: true },
        { name: '🔪 **Hits Given**', value: `${userStats.hits_given}`, inline: true },
        { name: '🛡️ **Hits Taken**', value: `${userStats.hits_taken}`, inline: true },
        { name: '🏆 **Round Win / Lose**', value: `${userStats.round_win} / ${userStats.round_lose}`, inline: true },
        { name: '⚖️ **W/L Ratio**', value: `${(userStats.round_win / (userStats.round_win + userStats.round_lose) * 100).toFixed(2)}%`, inline: true },
        { name: '⌚ **Total Time Played**', value: totalTimePlayed, inline: false }
    );

  await interaction.reply({ embeds: [embed] });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while fetching your statistics. Please try again later. ❌", ephemeral: false });
    }
  }
};
