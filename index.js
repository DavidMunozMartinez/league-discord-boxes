import * as utils from "./utilities.js";
import express from "express";
import cors from "cors";
import { discordClient } from "./src/discord-handler.js";
import { getChamp, assignSkinToUser } from "./src/league-api-handler.js";

const app = express();
import { UsersCollection } from "./src/mongo-handler.js";

app.use(express.json());
app.use(cors());
app.options("*", cors());

app.listen(process.env.PORT || 5000, () => {
  console.log("Aqui merengues: ", process.env.PORT || 5000);
});

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
        message.channel.send(arrayMessages || "");
      }
    }
  );
});

//make sure this line is the last line
discordClient.login(process.env.DISCORD_TOKEN); //login bot using token

/**
 * Make sure returns a promise that resolves in an array of strings
 * which will be sent as messages from the bot
 */
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
        resolve(command + "is not a valid command");
        break;
    }
  });
}

function giveUserChest(idDiscordUser) {
  let chestToGive = utils.getChestAmount();

  return new Promise((resolve, reject) => {
    let promise;
    UsersCollection.findOne({
      idDiscord: idDiscordUser,
    })
      .then((user) => {
        if (user) {
          let currentTime = new Date().getTime();
          let remainingTimeInMs = getUserRemainingTimeInMs(user, currentTime);
          // let remainingTimeInMinutes = utils.millisToMinutes(remainingTimeInMs);
          let remainingTimeInMinutes = -1;
          let canGetChest = remainingTimeInMinutes <= 0;

          if (canGetChest) {
            promise = incremetUserChests(
              idDiscordUser,
              chestToGive,
              currentTime
            );
          } else {
            let message = utils.getRemainingTimeMessage(remainingTimeInMinutes);
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
            resolve(message);
          })
          .catch((err) => {
            reject("Something went wrong");
          });
      })
      .catch((err) => {
        resolve("Something went wrong");
      });
  });
}

function getUserRemainingTimeInMs(user, currentTime) {
  // let currentTime = new Date().getTime();
  let timeLapsed = currentTime - user.lastChest;
  return utils.anHour * 3 - timeLapsed;
}

function incremetUserChests(id, amount, time) {
  return UsersCollection.findOneAndUpdate(
    {
      idDiscord: id,
    },
    {
      $inc: { cajitas: amount },
      $set: { lastChest: time },
    },
    { returnDocument: "after" }
  ).then(
    (res) =>
      `<@${id}> Obtuviste ${amount} cajitas, ahora tienes ${res.value.cajitas} cajitas`
  );
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
