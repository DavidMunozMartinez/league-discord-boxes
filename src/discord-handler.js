import Discord  from 'discord.js';

export const discordClient = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"],
});

//make sure this line is the last line

discordClient.on("ready", () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
});