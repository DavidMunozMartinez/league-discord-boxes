const chestPerChance = {
  50: 1,
  80: 2,
  90: 3,
  98: 4,
  100: 5,
};

// let timeLapsed = currentTime - user.lastChest;
export const aMinute = 60 * 1000;
export const anHour = aMinute * 60;

export const millisToMinutes = (millis) => {
  return Math.floor(millis / 60000);
}

export const millisToHours = (millis) => {
  return Math.floor(millis / 3600000);
}

export const minToHours = (min) => {
  return Math.floor(min / 60);
}

export function getRemainingTimeMessage(remainingTimeInMinutes) {
  // Calcular los mensajes
  let message = "Puedes volver a pedir en ";
  if (remainingTimeInMinutes < 60) {
    message += remainingTimeInMinutes + " minutos";
  } else {
    message += utils.minToHours(remainingTimeInMinutes) + " horas~";
  }
  return message;
}

export function getChestAmount() {
  let chance = Math.floor(Math.random() * 100);
  let chestAmount = 0;
  let prob = Object.keys(chestPerChance);
  for (let i = 0; i < prob.length; i++) {
    if (chance < prob[i]) {
      chestAmount = chestPerChance[prob[i]];
      console.log(chestAmount);
      break;
    }
  }

  return chestAmount;
}