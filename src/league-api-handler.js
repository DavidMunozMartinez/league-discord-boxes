import axios from 'axios';
import { UsersCollection } from './mongo-handler.js';
const API_URL =
  "http://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion.json";
const CHAMP_URL =
  "https://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion/";

export function getChamp() {
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

export function getRandomChamp(champList) {
  let names = Object.keys(champList);
  let random = names[Math.floor(Math.random() * names.length)];
  return random;
}

export function getChampData(name) {
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

export function displaySkin(name, data) {
  const randomSkin = data.skins[Math.floor(Math.random() * data.skins.length)];
  const champData = {
    idSkin: randomSkin.id,
    skinName: randomSkin.num === 0 ? name : randomSkin.name,
    image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_${randomSkin.num}.jpg`,
    champName: name,
  };

  return champData;
}

export function assignSkinToUser(idDiscordUser, data) {
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
