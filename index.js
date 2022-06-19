const express = require('express');
const cors = require('cors');
const { default: axios } = require('axios');
const API_URL = 'http://ddragon.leagueoflegends.com/cdn/12.11.1/data/en_US/champion.json';
const app = express();

process.env.PORT = 8080;
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.options('*',cors());

app.listen(PORT, () => {
    // console.log('Aqui merengues');

    // axios.get(API_URL + 'Ezreal.json', {
    // }).then((res) => {
    //     console.log(res);
    // })
    // .catch((reason) => {
    //     console.log(reason);
    // });
});

// app.get('/aqui-merengues', (req, res) => {
//     res.send('Simon');
// });

app.get('/get-random-champ', (req, res) => {
    getChamp().then((randomChamp) => {
        res.send(randomChamp)
    });
});

function getChamp(champName) {
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
    // console.log(random);

    return random;


    // console.log(names);
}



