const express = require('express');
const cors = require('cors');
const Discord = require('discord.js');
const { default: axios } = require('axios');
const API_URL = 'http://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion.json';
const app = express();

let test = {};
let i = 0;

app.use(express.json());
app.use(cors());
app.options('*',cors());

require('dotenv').config(); //initialize dotenv

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"]}); //create new client

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
    if (message.channelId !== "843700429450641419" || message.author.id === "987880205873999932")
    return;
    console.log(i++);

    if (isCommand(message.content)) {
        getChamp().then((name) => {
            message.channel.send(name);
        });
    }

    test[message.author.id] = true;
    console.log(message);
});

function isCommand(text) {
    return text[0] === '!';
}


//make sure this line is the last line
client.login(process.env.DISCORD_TOKEN); //login bot using token

app.listen(process.env.PORT || 5000, () => {
    console.log('Aqui merengues');
});

function getChamp() {
    return new Promise((resolve, reject) => {
        axios
            .get(API_URL)
            .then((res) => {
                let champ = getRandomChamp(res.data.data);
                resolve(champ);
            })
            .catch((reason) => {
                reject(reason);
            })
    });
}

function getRandomChamp(champList) {
    let names = Object.keys(champList);
    let random = names[Math.floor(Math.random() * names.length)];
    return random;
}



