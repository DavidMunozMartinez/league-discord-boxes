import dotenv from "dotenv";
dotenv.config();
import * as utils from "./utilities.js";
import express from "express";
import cors from "cors";
import { discordClient } from "./src/discord-handler.js";
import { getChamp } from "./src/league-api-handler.js";

const app = express();
import { UsersCollection } from "./src/mongo-handler.js";

app.use(express.json());
app.use(cors());
app.options("*", cors());

discordClient.on("message", (message) => {
  let earlyReturn =
    message.channelId !== "990774540059680809" ||
    message.author.id === "987880205873999932";

  if (earlyReturn) return;

  executeCommand(message.content.split(" ")[0], message.author.id).then(
    (arrayMessages) => {
      if (arrayMessages.length) {
        //value: arrays of strings
        arrayMessages.forEach((messageValue) => {
          message.channel.send(messageValue || "");
        });
      } else {
        message.channel.send(messageValue || "");
      }
    }
  );
});

//make sure this line is the last line
discordClient.login(process.env.DISCORD_TOKEN); //login bot using token

function executeCommand(command, idDiscordUser) {
  return new Promise((resolve, reject) => {
    switch (command) {
      case "!chest":
        giveUserChest(idDiscordUser)
          .then((message) => resolve([message]))
          .catch((err) => resolve(err));
        break;
      case "!openChest":
        openUserChest(idDiscordUser)
          .then((message) => resolve(message))
          .catch((err) => resolve(err));
        break;
      case "!trade":
        resolve("Not ready yet");
        break;
      default:
        //not a command
        resolve('command + "is not a valid command"');
        break;
    }
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log("Aqui merengues: ", process.env.PORT || 5000);
});

function giveUserChest(idDiscordUser) {
  let chestToGive = getChestAmount();

  return new Promise((resolve, reject) => {
    let promise;
    UsersCollection.findOne({
      idDiscord: idDiscordUser,
    })
      .then((user) => {
        if (user) {
          let currentTime = new Date().getTime();
          let timeLapsed = currentTime - user.lastChest;
          const aMinute = 60 * 1000;
          const anHour = aMinute * 60;

          let remainingTimeInMs = anHour * 3 - timeLapsed;
          let remainingTimeInMinutes = utils.millisToMinutes(remainingTimeInMs);

          if (remainingTimeInMinutes <= 0) {
            promise = user
              .updateOne({
                $inc: { cajitas: chestToGive },
                $set: { lastChest: currentTime },
              })
              .then(
                () =>
                  `<@${idDiscordUser}> Obtuviste ${chestToGive} cajitas, ahora tienes ${res.value.cajitas} cajitas`
              );
          } else {
            let message = getRemainingTimeMessage(remainingTimeInMinutes);
            promise = Promise.resolve(`Ya pediste. \n ${message}`);
          }
        } else {
          promise = UsersCollection.insertOne({
            idDiscord: idDiscordUser,
            cajitas: chestToGive,
            lastChest: new Date().getTime(),
          }).then(
            () =>
              `<@${idDiscordUser}> Obtuviste ${chestToGive} cajitas, ahora tienes ${res.value.cajitas} cajitas`
          );
        }

        promise
          .then((message) => {
            console.log(message);
            resolve(message);
          })
          .catch((err) => {
            reject("Something went wrong");
          });
      })
      .catch((err) => {
        resolve("Something went wrong");
        console.log(err);
      });
  });
}

function getChestAmount() {
  let chance = Math.floor(Math.random() * 100);
  let cajitasToGive = 0;
  const chestPerChance = {
    50: 1,
    80: 2,
    90: 3,
    98: 4,
    100: 5,
  };

  let prob = Object.keys(chestPerChance);

  for (let i = 0; i < prob.length; i++) {
    if (chance < prob[i]) {
      cajitasToGive = chestPerChance[prob[i]];
      console.log(cajitasToGive);
      break;
    }
  }

  return cajitasToGive;
}

function getRemainingTimeMessage(remainingTimeInMinutes) {
  // Calcular los mensajes
  let message = "Puedes volver a pedir en ";
  if (remainingTimeInMinutes < 60) {
    message += remainingTimeInMinutes + " minutos";
  } else {
    message += utils.minToHours(remainingTimeInMinutes) + " horas~";
  }
  return message;
}

function openUserChest(idDiscordUser) {
  return new Promise((resolve, reject) => {
    getChamp()
      .then((data) => {
        //skinName, image, idSkin, champName
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
  let $filter = {
    idDiscord: idDiscordUser,
    cajitas: { $gt: 0 },
  };
  let $incremet = {
    $inc: {
      cajitas: -1,
      ["skins." + data.champName + "." + data.idSkin + ".count"]: 1,
    },
  };
  let $returnDoc = { returnDocument: "after" };
  return new Promise((resolve, reject) => {
    UsersCollection.findOneAndUpdate($filter, $incremet, $returnDoc)
      .then((res) => {
        console.log(res);
        if (res.value && res.value.cajitas) {
          let plural = res.value.cajitas > 1;
          let sentence = `Te ${
            plural ? "quedan " + res.value.cajitas : "queda una"
          } cajita${plural ? "s" : ""}`;
          resolve(`<@${idDiscordUser}> ${sentence}`);
        } else {
          resolve(`<@${idDiscordUser}> No tienes cajitas we`);
        }
      })
      .catch((err) => {
        console.log(err);
        reject("chingatumadrewe no sabes programar");
      });
  });
}
