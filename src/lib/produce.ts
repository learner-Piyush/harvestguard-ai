export const fruitsList = [
  "apple",
  "banana",
  "orange",
  "strawberry",
  "grape",
  "peach",
  "pear",
  "mango",
  "berry",
  "cherry",
  "melon",
];

export const getCategory = (produceType: string): "fruit" | "vegetable" => {
  const name = produceType.toLowerCase();
  if (fruitsList.some((fruit) => name.includes(fruit))) {
    return "fruit";
  }
  return "vegetable";
};
