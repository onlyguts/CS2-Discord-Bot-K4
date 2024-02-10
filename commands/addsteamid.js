const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addsteamid')
    .setDescription('Links your Steam account to your Discord profile')
    .addStringOption(option =>
      option.setName('steam_id')
        .setDescription('Your Steam ID to be added.')
        .setRequired(true)),
  async execute(interaction, client) {
    const steamId = interaction.options.getString('steam_id');
    const userId = interaction.user.id; 
    try {
      const connection = await mysql.createConnection(config.dbConfig);
      const checkQuery = 'SELECT * FROM user_discord WHERE discord_id = ?';
      const [rows] = await connection.execute(checkQuery, [userId]);
      if (rows.length > 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription('You have already added a Steam ID.');
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        await connection.end();
        return;
      }
      const insertQuery = 'INSERT INTO user_discord (discord_id, steam_id) VALUES (?, ?)';
      await connection.execute(insertQuery, [userId, steamId]);
      await connection.end();
      await interaction.reply({ content: "Your Steam ID has been successfully added!", ephemeral: true });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error occurred while adding your Steam ID. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
