import { type BallType } from "../types/balls";
import { getRandomInt } from "./get-random-int";

export const getBalls = (quantity: number, canvasWidth: number, canvasHeight: number): BallType[] => {
const array: BallType[] = [];
for (let index = 0; index < quantity; index++) {
  const radius = getRandomInt(10, 40)
  array.push({
    x: getRandomInt(radius, canvasWidth - radius),
    y: getRandomInt(radius, canvasHeight - radius),
    acceleration: {
      x: 0,
      y: 0,
    },
    radius,
    key: index,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  })
  
}
  return array;
}