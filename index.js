
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config');
const mysql = require('mysql2/promise');
const config = require('./config');

let leaderboardMessageId = config.leaderboard.MessageId; 
const leaderboardChannelId = config.leaderboard.ChannelId; 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
console.log('🔄 Loading commands...');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  console.log('⏩ Loading : /' + command.data.name);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.APPLICATION_ID_BOT, config.GUILD_ID),
      { body: commands },
    );
    console.log('✅ Commands successfully loaded!');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('🤖 Bot started and running!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error 1', ephemeral: true });
  }
});

async function updateLeaderboard(client, channelId) {
    const connection = await mysql.createConnection(config.dbConfig);
    const [rows] = await connection.execute('SELECT * FROM k4ranks ORDER BY points DESC LIMIT 5');
    await connection.end();

    function formatName(name) {
      if (name.length > 10) {
          return name.substring(0, 10);
      } else {
          return name;
      }
    }

    let leaderboardDescription = rows.map((row, index) => {
        let prefix = "";
        if (index === 0) prefix = "🥇";
        else if (index === 1) prefix = "🥈";
        else if (index === 2) prefix = "🥉";
        else if (index <= 3) prefix = "📀";
        else if (index <= 4) prefix = "💿";
        return `${prefix} **${formatName(row.name)}** \n${row.points} points\n`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .setDescription(leaderboardDescription)
        .setColor('#0099ff')
        .setTimestamp();

    const channel = await client.channels.fetch(channelId);
    if (leaderboardMessageId) {
        try {
            const message = await channel.messages.fetch(leaderboardMessageId);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error("Error 2", error);
        }
    } else {
        const message = await channel.send({ embeds: [embed] });
        leaderboardMessageId = message.id;
    }
}
client.once('ready', async () => {
    await updateLeaderboard(client, leaderboardChannelId); 
    setInterval(async () => {
        await updateLeaderboard(client, leaderboardChannelId); 
    }, 1800000); 
});
client.login(token);
