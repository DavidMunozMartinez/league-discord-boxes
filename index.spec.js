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
