require("dotenv").config(); //initialize dotenv
const express = require("express");
const cors = require("cors");
const Discord = require("discord.js");
const { default: axios } = require("axios");
const API_URL =
  "http://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion.json";
const CHAMP_URL =
  "https://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion/";
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASSWORD}@cluster0.ceyoj.gcp.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
let UsersCollection;
mongoClient.connect((err) => {
  UsersCollection = mongoClient.db("user").collection("users");
});

app.use(express.json());
app.use(cors());
app.options("*", cors());

const user = {
  _id: "",
  idDiscord: "",
  cajitas: 0,
};

const discordClient = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
}); //create new client

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on("message", (message) => {
  //   console.log(message);
  if (
    message.channelId !== "990774540059680809" ||
    message.author.id === "987880205873999932"
  )
    return;

  // message.channel.send('Olaputo');
  //   console.log(message);
  //const user = userExist() ? getUser() : createUser();

  executeCommand(message.content.split(" ")[0], message.author.id).then(
    (arrayMessages) => {
        //value: arrays of strings
        arrayMessages.forEach(messageValue => {
            message.channel.send(messageValue || "");
        });
    }
  );

  /* if (isCommand(message.content)) {
        getChamp().then((data) => {
            message.channel.send(data.skinName);
            message.channel.send(data.image);
        });
    } */
});

function isCommand(text) {
  return text[0] === "!";
}

function executeCommand(command, idDiscordUser) {
  let message = "";
  return new Promise((resolve, reject) => {
    switch (command) {
      case "!chest":
        // tiempo para nueva cajita?
        giveUserChest(idDiscordUser)
          .then((message) => resolve([message]))
          .catch((err) => resolve(err));
        break;
      case "!openChest":
        //
        openUserChest(idDiscordUser).then((message) => resolve(message));
        break;
      case "!trade":
        //
        break;
      default:
        //not a command
        message = command + "is not a valid command";
        break;
    }

    // resolve(message);
  });
}

//make sure this line is the last line
discordClient.login(process.env.DISCORD_TOKEN); //login bot using token

app.listen(process.env.PORT || 5000, () => {
  console.log("Aqui merengues: ", process.env.PORT || 5000);
});

function getChamp() {
  return new Promise((resolve, reject) => {
    axios
      .get(API_URL)
      .then((res) => {
        let champName = getRandomChamp(res.data.data);
        console.log(champName);
        getChampData(champName).then((skin) => {
          resolve(skin);
        });
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

function getRandomChamp(champList) {
  let names = Object.keys(champList);
  let random = names[Math.floor(Math.random() * names.length)];
  return random;
}

function getChampData(name) {
  return new Promise((resolve, reject) => {
    axios
      .get(CHAMP_URL + name + ".json")
      .then((res) => {
        let skin = displaySkin(name, res.data.data[name]);
        resolve(skin);
      })
      .catch((reason) => {
        console.log("trono el champ data we");
        console.log(reason.message);
      });
  });
}

function displaySkin(name, data) {
  const randomSkin = data.skins[Math.floor(Math.random() * data.skins.length)];
  //   console.log(randomSkin);
  const champData = {
    idSkin: randomSkin.id,
    skinName: randomSkin.num === 0 ? name : randomSkin.name,
    image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_${randomSkin.num}.jpg`,
    champName: name,
  };

  return champData;
}

function giveUserChest(idDiscordUser) {
  let chance = Math.floor(Math.random() * 100);
  let cajitas = 0;
  const chestPerChance = {
    50: 1,
    80: 2,
    90: 3,
    98: 4,
    100: 5
  };
  
  prob = Object.keys(chestPerChance);
  console.log(chance);
  for(let i = 0; i < prob.length; i++){
    if (chance < prob[i]) {
      cajitas = chestPerChance[prob[i]];
      console.log(cajitas);
      break;
    }
  }

  return new Promise((resolve, reject) => {
    let promise;
    UsersCollection.findOne({
      idDiscord: idDiscordUser
    }).then((user) => {
      if (user) {
        let timeLapsed = new Date().getTime() - user.lastChest;
        let aMinute = 60 * 1000;
        let anHour = aMinute * 60;
        let remainingTime = (anHour * 3) - timeLapsed

        if (remainingTime <= aMinute) {
          time = 'te quedan unos segundos';
        } else if (remainingTime > aMinute && remainingTime <= anHour) {
          let minutes = Math.round(remainingTime / aMinute);
          time = `esperese ${minutes} minutos`;
        } else if (remainingTime > anHour) {
          let hours = Math.round(remainingTime / (60 * 1000 * 60));
          time = hours > 1 ? `faltan ${hours} horas` : 'masomeno una hora'
        }

        if (time > 1000 * 60 * 60 * 3) {
          promise = user.updateOne({
            $inc: { cajitas: cajitas },
            $set: { lastChest: new Date().getTime() }
          }).then(() => `<@${idDiscordUser}> Obtuviste ${cajitas} cajitas, ahora tienes ${res.value.cajitas} cajitas`);
        } else {
          // let remaining = new Date(time).toLocaleTimeString();
          promise = Promise.resolve(`Ya pediste, ${time}`);
        }
      } else {
        promise = UsersCollection.insertOne({
          idDiscord: idDiscordUser,
          cajitas: cajitas,
          lastChest: new Date().getTime()
        }).then(() => `<@${idDiscordUser}> Obtuviste ${cajitas} cajitas, ahora tienes ${res.value.cajitas} cajitas`);
      }

      promise
      .then((message) => {
        resolve(message);
      })
      .catch((err) => {
        reject("chingatumadrewe no sabes programar")
      });
    });
  });
}

function openUserChest(idDiscordUser) {
  return new Promise((resolve, reject) => {
    getChamp()
      .then((data) => {
        //skinName, image, idSkin, champName
        // message.channel.send(data.skinName);
        // message.channel.send(data.image);

        assignSkinToUser(idDiscordUser, data).then((result) => {
            resolve([data.skinName, data.image, result]);
        });
      })
      .catch((err) => {
        console.log(err);
        reject("fue aqui alv");
      });
  });
}

function assignSkinToUser(idDiscordUser, data) {
  return new Promise((resolve, reject) => {
    UsersCollection.findOneAndUpdate(
      {
        idDiscord: idDiscordUser,
        cajitas: { $gt: 0 }
      },
      {
        $inc: {
            cajitas: -1,
            ['skins.' + data.champName + '.' + data.idSkin + '.count']: 1
        }
      },
      {
        returnDocument: 'after'
      }
    )
      .then((res) => {
        console.log(res);
        if (res.value && res.value.cajitas) {
          let plural = res.value.cajitas > 1;
          let sentence = `Te ${plural ? 'quedan ' + res.value.cajitas : 'queda una'} cajita${plural ? 's' : ''}`
          resolve(`<@${idDiscordUser}> ${sentence}`);
        } else {
          resolve(`<@${idDiscordUser}> No tienes cajitas we`)
        }
      })
      .catch((err) => {
        console.log(err);
        reject("chingatumadrewe no sabes programar");
      });
  });
}
