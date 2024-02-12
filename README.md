# CS2-Discord-Bot-K4 

CS2-Discord-Bot-K4 is a Discord bot designed to seamlessly integrate with the [K4-System](https://github.com/K4ryuu/K4-System).

## 📦 Dependencies
- Requires [Node.js](https://nodejs.org/en/) v16.11.0 or higher.
- [MySQL](https://www.mysql.com/en/)
 

## 🚀 Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/onlyguts/CS2-Discord-Bot-K4.git
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Settings**:
   Set up your `config.js` with your Discord bot token and database.

4. **Start the Bot**:
   ```bash
   node index.js
   ```
## ✨ Features 

- **Real-time Stats**: Access your gaming statistics directly on Discord. View your ranks, points, and more.
- **Dynamic Leaderboard**: Our leaderboard updates every 30 minutes and posts in a dedicated channel before updating to reflect the latest standings. Keep an eye on the top players and see where you stand among them.
- **Cheat Detection**: Use our advanced commands to identify suspicious player.
- **Admin Tools**: Specific commands are available for admins, allowing them to quickly get a player's statistics or Steam ID.

 **Below is a list of available commands for the CS2-Discord-Bot-K4 and their descriptions:**

Players commands :

- `/help` Displays a list of available commands and their functions.
  
- `/addsteamid [steam_id (required)]` Links your Steam account to your Discord profile for personalized statistics and features.

- `/myrank` Displays your rank and points.

- `/mystat` Shows detailed statistics.

- `/topplayers` Lists the top 10 players in k4ranks.

- `/bot-info` Provides general information and statistics about the Bot and [K4-System](https://github.com/K4ryuu/K4-System).

Admin commands :
- `/checkcheater [steam_id (not required)]` Detects suspicious players based on advanced game statistics.

- `/getsteamid [name (required)]` Retrieves the Steam IDs of players by their name from the k4stats table.

- `/stats [steam_id (required)]` Displays the statistics of a specified player based on their Steam ID.

## 🗂️ Contributions 

Contributions to CS2-Discord-Bot-K4 are highly encouraged, whether through feature development, bug fixes, or feedback.
 
## 🤝 Credits

- [K4ryuu](https://github.com/K4ryuu)
  
