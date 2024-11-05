let totalCalories = 0;
let foodList = [];
const foodItems = [
  "eple",
  "banan",
  "appelsin",
  "jordbær",
  "drue",
  "vannmelon",
  "blåbær",
  "kiwi",
  "ananas",
  "mango",
  "kyllingbryst",
  "laks",
  "biff",
  "pasta",
  "ris",
  "quinoa",
  "brokkoli",
  "gulrøtter",
  "poteter",
  "tofu",
];

const translationDictionary = {
  eple: "apple",
  banan: "banana",
  appelsin: "orange",
  jordbær: "strawberry",
  drue: "grape",
  vannmelon: "watermelon",
  blåbær: "blueberry",
  kiwi: "kiwi",
  ananas: "pineapple",
  mango: "mango",
  kyllingbryst: "chicken breast",
  laks: "salmon",
  biff: "steak",
  pasta: "pasta",
  ris: "rice",
  quinoa: "quinoa",
  brokkoli: "broccoli",
  gulrøtter: "carrots",
  poteter: "potatoes",
  tofu: "tofu",
};

const reverseTranslationDictionary = Object.fromEntries(
  Object.entries(translationDictionary).map(([key, value]) => [value, key])
);

// Load data from localStorage
window.addEventListener("load", () => {
  const storedFoodList = localStorage.getItem("foodList");
  const storedTotalCalories = localStorage.getItem("totalCalories");

  if (storedFoodList) {
    foodList = JSON.parse(storedFoodList);
    totalCalories = parseInt(storedTotalCalories, 10) || 0;
    updateResult();
  }
});

document.getElementById("foodQuery").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addFood();
  }
});

document.getElementById("addFood").addEventListener("click", addFood);

function addFood() {
  const appId = "3be4d2f0"; // Replace with your Nutritionix App ID
  const appKey = "4e0c9f38df9c82f92f82d061d3d20ce0"; // Replace with your Nutritionix App Key
  let query = document.getElementById("foodQuery").value; // Get the query from the input field

  // Translate query if it's in Norwegian
  if (translationDictionary[query.toLowerCase()]) {
    query = translationDictionary[query.toLowerCase()];
  }

  fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-id": appId,
      "x-app-key": appKey,
    },
    body: JSON.stringify({
      query: query,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        const calories = food.nf_calories;
        const photoUrl = food.photo.thumb;

        const translatedName =
          reverseTranslationDictionary[query.toLowerCase()] || query;

        totalCalories += calories;
        foodList.push({
          name: translatedName,
          calories: calories,
          photo: photoUrl,
        });
        updateResult();
      } else {
        document.getElementById(
          "result"
        ).textContent = `Ingen data funnet for ${query}`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

document.getElementById("generateDiet").addEventListener("click", () => {
  const appId = "3be4d2f0"; // Replace with your Nutritionix App ID
  const appKey = "4e0c9f38df9c82f92f82d061d3d20ce0"; // Replace with your Nutritionix App Key
  const calorieLimit = parseInt(
    document.getElementById("calorieLimit").value,
    10
  ); // Get the calorie limit

  totalCalories = 0;
  foodList = [];
  generateDiet(appId, appKey, calorieLimit, foodItems);
});

function generateDiet(appId, appKey, calorieLimit, items) {
  const promises = items.map((item) => {
    let query = item;

    // Translate query if it's in Norwegian
    if (translationDictionary[query.toLowerCase()]) {
      query = translationDictionary[query.toLowerCase()];
    }

    return fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": appId,
        "x-app-key": appKey,
      },
      body: JSON.stringify({ query: query }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];
          const translatedName =
            reverseTranslationDictionary[item.toLowerCase()] || item;
          return {
            name: translatedName,
            calories: food.nf_calories,
            photo: food.photo.thumb,
          };
        }
        return null;
      });
  });

  Promise.all(promises)
    .then((results) => {
      results.forEach((food) => {
        if (food && totalCalories + food.calories <= calorieLimit) {
          totalCalories += food.calories;
          foodList.push(food);
        }
      });
      updateResult();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateResult() {
  let resultText = `Totale kalorier: ${totalCalories}\n\nMatvareliste:\n`;
  foodList.forEach((item, index) => {
    resultText += `${item.name}: ${item.calories} kalorier <button onclick="removeItem(${index})">x</button>\n`;
    resultText += `<img src="${item.photo}" alt="${item.name}" />\n`;
  });

  document.getElementById("result").innerHTML = resultText;

  // Save data to localStorage
  localStorage.setItem("foodList", JSON.stringify(foodList));
  localStorage.setItem("totalCalories", totalCalories.toString());
}

function removeItem(index) {
  totalCalories -= foodList[index].calories;
  foodList.splice(index, 1);
  updateResult();
}
