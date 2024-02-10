const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands and their functions.'),
  async execute(interaction, client) {
    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Help - List of Commands')
      .setDescription('Here are the available commands:');

    client.commands.forEach((command) => {
      helpEmbed.addFields({ name: `/${command.data.name}`, value: command.data.description });
    });

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
