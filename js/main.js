// Money babyyy.
let hearts = 0;

let intervalE = 1000;

const urlString = window.location.search;
const urlParams = new URLSearchParams(urlString);
const heartString = urlParams.get("h");
hearts = parseInt(heartString);
hearts = isNaN(hearts) ? 0 : hearts;


// The starting power of the mouse. Little weak thing it is.
let baseClickPower = 0.01;
// The actual value used, baseClickPower ends up existing for math purposes later.
let clickPower = baseClickPower;

// The most important part of the game, profits.
function increaseHearts() {
   hearts += clickPower;
   displayHearts();
}

// Updates the container(s) that hold the amount of hearts and whatnot.
function displayHearts() {
   document.getElementById("heart-counter").innerHTML = "&#10084; " + ((hearts * 100) / 100).toFixed(2);
   document.getElementById("hps").innerHTML = ((perSecondIncrease() * 100) / 100).toFixed(2) + " hps";
   document.getElementById("hpc").innerHTML = ((clickPower* 100) / 100).toFixed(2) + " hpc";
}

// Returns the Item variant depending on the name.
function getItemType(name) {
   let lowered = name.toLowerCase();
   switch(lowered) {
      case "autoclicker":
         return storeItems[0];
      case "itemtwo":
         return storeItems[1];
      case "itemthree":
         return storeItems[2];
      case "itemfour":
         return storeItems[3];
      case "itemfive":
         return storeItems[4];
      case "itemsix":
         return storeItems[5];
      case "itemseven":
         return storeItems[6];
   }
}

// Our list of bad bois.
let storeItems = [
   new AutoClicker("6D6F7265"),
   new ItemTwo("7468616E"),
   new ItemThree("616E797468696E672C"),
   new ItemFour("49"),
   new ItemFive("6C6F7665"),
   new ItemSix("796F75"),
   new ItemSeven("497679"),
];

const loopfunc = function() {
   // 1. Increase hearts.
   hearts += perSecondIncrease();
   // 2. Set click power if any upgrades were gotten.
   clickPower = baseClickPower + getClickPower();
   // 3. Display heart balance update.
   displayHearts();
   updateAllShopItems();
   // 4. If there are any final upgrades ready to unlock, do so.
   for (let item of storeItems) {
      item.checkFinalUpgrade();
   }
}

// The overall game loop.
let interval = setInterval(loopfunc, intervalE); // Every second.

// Per second increase of hearts, gets the total power of all items and adds them all together.
function perSecondIncrease() {
   let amountToAdd = storeItems.reduce(function (partialSum, element) { return partialSum + (element.amount * element.power * element.getMultiplier()); }, 0);

   return amountToAdd;
}

// The total click power decided by upgrades and such.
function getClickPower() {
   let amountToAdd = storeItems.reduce(function (partialSum, element) { return partialSum + (element.sumClickPower()); }, 0);

   return amountToAdd;
}

// The total amount of all items purchased.
function getTotalAmount() {
   let totalAmount = 0;

   for (let element of storeItems) {
      totalAmount += element.amount;
   }

   return totalAmount;
}

// The total amount of all upgrades purchased.
function getTotalUpgrades() {
   let totalAmount = 0;

   for (let element of storeItems) {
      for (let upgrade of element.upgradeList) {
         if (upgrade.bought) {
            totalAmount += 1;
         }
      }
   }

   return totalAmount;
}

// Visually update all shop items in case any upgrades additionally add hps to other items.
function updateAllShopItems() {
   for (let element of storeItems) {
      document.getElementById(element.itemName + "-listing-name").innerHTML = element.flavorName + " x " + element.amount;
      document.getElementById(element.itemName + "-hps").innerHTML = ((element.power * element.amount * element.getMultiplier()* 100) / 100).toFixed(3) + " hps";
      document.getElementById(element.itemName + "-hps-multiplier").innerHTML = "x" + ((element.getMultiplier()* 100) / 100).toFixed(2);
   }
}