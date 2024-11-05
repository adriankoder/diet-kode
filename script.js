let totalCalories = 0;
let foodList = [];

document.getElementById("fetchData").addEventListener("click", () => {
  const appId = "3be4d2f0"; // Replace with your Nutritionix App ID
  const appKey = "4e0c9f38df9c82f92f82d061d3d20ce0"; // Replace with your Nutritionix App Key
  const query = document.getElementById("foodQuery").value; // Get the query from the input field

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
        totalCalories += calories;
        foodList.push({ name: query, calories: calories, photo: photoUrl });

        updateResult();
      } else {
        document.getElementById(
          "result"
        ).textContent = `No data found for ${query}`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

function updateResult() {
  let resultText = `Total Calories: ${totalCalories}\n\nFood List:\n`;
  foodList.forEach((item, index) => {
    resultText += `${item.name}: ${item.calories} calories <button onclick="removeItem(${index})">x</button>\n`;
    resultText += `<img src="${item.photo}" alt="${item.name}" />\n`;
  });

  document.getElementById("result").innerHTML = resultText;
}

function removeItem(index) {
  totalCalories -= foodList[index].calories;
  foodList.splice(index, 1);
  updateResult();
}
