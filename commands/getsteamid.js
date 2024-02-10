const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getsteamid')
    .setDescription('[ADMIN] Retrieves the Steam IDs of players by their name from the k4stats table.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the player to search for.')
        .setRequired(true)),
        
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.requiredRoleId)) {
        await interaction.reply({ content: "⛔ You do not have permission to use this command.", ephemeral: true });
        return;
      }

    const playerName = interaction.options.getString('name');

    try {
      const connection = await mysql.createConnection(config.dbConfig);
      const query = 'SELECT id, name, steam_id FROM k4stats WHERE name LIKE ? LIMIT 100';
      const [rows] = await connection.execute(query, [`%${playerName}%`]);

      if (rows.length === 0) {
        await interaction.reply({ content: "No players found with that name.", ephemeral: true });
        await connection.end();
        return;
      }
      function formatName(name) {
        if (name.length > 10) {
            return name.substring(0, 10);
        } else {
            return name;
        }
      }

      let description = rows.map((row, index) => 
        `${index + 1}. [**ID:** ${row.id}] **Name:** ${formatName(row.name)}, **Steam ID:** ${row.steam_id}`
      ).join('\n');

      if(description.length > 4096){
        description = description.substring(0, 4093) + '...'; 
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Player Names and Steam IDs Found')
        .setDescription(description)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while searching for Steam IDs. Please try again later.", ephemeral: true });
    }
  }
};
