// Initially I was hoping I could reuse a base class for both the main and upgrade
// items, but after a while I figured separating them would be more beneficial for
// me. This is merely a remnant of that idea that I'm too lazy to clean up. This
// is only used by MainItem. :(
class BaseItem {
   constructor(name, startingPrice, startingPower) {
      // The name of the item. Mostly used for ids.
      this.itemName = name;
      // Price of the item.
      this.price = startingPrice;
      // Power of the item.
      this.power = startingPower;
      // The number of items purchased.
      this.amount = 0;
      // If this item is completed or not.
      this.completed = false;
   }
}

// The base class for upgrades in the game, it's a little whacky!
class UpgradeItem {
   constructor(parentName, flavor, startPrice, forMultiplier, ability, doOnce = () => {void(0)}) {
      // The name of the parent, similarly for id purposes.
      this.parentName = parentName;
      // Flavor text.
      this.flavor = flavor;
      // The price of the item.
      this.price = startPrice;
      // What the function does per loop.
      this.function = ability;
      // If this upgrade is bought or not.
      this.bought = false;
      // If this.function is for the item's power (true) or the click power (false).
      this.type = forMultiplier;
      // A function containing actions to do only once upon buying.
      this.doOnceAction = doOnce;
   }

   // Buying the upgrade.
   buy() {
      // Success bool to decide whether we disable the upgrade button or not.
      let success = false;

      if (hearts >= this.price) {
         hearts -= this.price;
         this.bought = true;
         success = true;

         // If there is an action to do once, do it.
         this.doOnceAction();

         // Update visuals.
         updateAllShopItems();
         displayHearts();
      }

      return success;
   }

   // Creates the button to buy the upgrade.
   createButton() {
      let _this = this;
      // Create button and functionality
      let button = document.getElementById(this.parentName);
      if (button == null) {
         button = document.createElement("button");
         button.id = this.parentName;
         button.onclick = function() { let success = _this.buy(); success ? this.disabled = true : void(0); };
      }

      button.innerHTML = this.price;

      // Create the span for the delicious flavor.
      let description = document.createElement("span");
      description.className = "hovertext";
      description.innerHTML = this.flavor;

      button.appendChild(description);
      return button;
   }
}

// The actual items themselves. The stuff that can be bought.
class MainItem extends BaseItem {
   constructor(flavorName, name, code, startingPrice, startingPower) {
      // Calling parent constructor, BaseItem.
      super(name, startingPrice, startingPower);
      this.flavorName = flavorName;
      // The list of upgrades that are tied to this item.
      this.upgradeList = [];
      // How much the click value is impacted.
      this.clickImpact = 1;
      // How much the price of the item is impacted.
      // Higher values decrease the price.
      this.costMultiplier = 1;
      // Hidden value.
      this.code = code;
   }

   // Buying an upgrade.
   buy() {
      if (hearts >= this.price) {
         hearts -= this.price;
         this.amount += 1;
         // Increase the price by some range, normally 20% increase.
         this.price *= (1.2 / this.costMultiplier);

         // Update visuals.
         updateAllShopItems()
         document.getElementById(this.itemName + "-button").innerHTML = "&#10084;" + ((this.price * 100) / 100).toFixed(2);
         displayHearts();
      }
   }

   // Get the power multiplier for this item based on upgrade functionality.
   getMultiplier() {
      let multiplier = 1;

      // For every upgrade, if it is an upgrade meant for item power and its been
      // bought, get whatever value is returned from the function and add it.
      for (let i in this.upgradeList) {
         if (this.upgradeList[i].type == true) {
            multiplier += this.upgradeList[i].bought ? this.upgradeList[i].function() : 0;
         }
      }

      return multiplier;
   }

   // Get the power multiplier for the mouse clicks.
   sumClickPower() {
      let multiplier = 0;

      // Same as getMultiplier but for the click power.
      for (let i in this.upgradeList) {
         if (this.upgradeList[i].type == false){
            multiplier += this.upgradeList[i].bought ? this.upgradeList[i].function() : 0;
         }
      }

      // Additional multiplication for bonus.
      multiplier *= this.clickImpact;

      return multiplier;
   }

   // Returns the number of bought upgrades.
   getBoughtUpgrades() {
      let upgrades = 0;

      for (let i in this.upgradeList) {
         if (this.upgradeList[i].bought == true){
            upgrades += 1;
         }
      }

      return upgrades;
   }

   // Function to reveal the final upgrade if all other upgrades are bought.
   checkFinalUpgrade = function() {
      // If the item has been bought at least once and all other upgrades have
      // been purchased, reveal the final upgrade, which is always the last
      // one in the list.
      if (this.amount > 0 && this.getBoughtUpgrades() == this.upgradeList.length - 1) {
         let upgradeDiv = document.getElementById(this.itemName + "-upgrade-container");

         upgradeDiv.appendChild(this.upgradeList[this.upgradeList.length - 1].createButton());

         // Destroy this function so it never runs again. :)
         // I know it's lazy (and not really safe?) but it's simple. 
         this.checkFinalUpgrade = function() {};
      }
   };

   // Parses hex string to text.
   parseCode() {
      let str = '';
      for (let i = 0; i < this.code.length; i += 2) {
         str += String.fromCharCode(parseInt(this.code.substr(i, 2), 16));
      }
      return str;
   }

   // Action to run when the final upgrade has been purchased.
   completeItem() {
      this.completed = true;
      let buyButton = document.getElementById(this.itemName + "-button");
      buyButton.style = "background: black; color: white;";
      buyButton.innerHTML = this.parseCode();
      buyButton.disabled = true; 
   }
}

class AutoClicker extends MainItem {
   constructor(code) {
      super("Good Morning!", "AutoClicker", code, 0.25, 0.001);
      let _this = this;
      // List of upgrades below.
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "1",
            "Increases hps multiplier by 1.5 for this unit.",
            1, 
            true, 
            function() { return ( 1.5 ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '2',
            "Total hps multiplier for this item increased by 0.001 for the number of times you've clicked the heart since purchasing.",
            3, 
            true, 
            function() { return (numberClicked * 0.001); },
            function() { numberClicked = 0; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '3', 
            "adds unit hps to click power",
            5, 
            false, 
            function() { return (_this.amount * _this.power * _this.getMultiplier()) }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '4',
            "Increases hps multiplier by 2.5 for this unit.",
            20, 
            true, 
            function() { return ( 2.5 ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "5",
            "Multiplies the click power impact by 15%.",
            50, 
            false, 
            function() { return 0; },
            function() { _this.clickImpact += 0.15; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName +'6',
            "Total hps for this item increased by 2% per number of this item owned.",
            100, 
            true, 
            function() { return (_this.amount * 0.02); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '7',
            "Decreases price and cost multiplier by 2% (more effective the earlier you buy!)",
            200, 
            true, 
            function() { return 0; }, 
            function() { _this.price *= 0.98; _this.costMultiplier += 0.02; 
                         document.getElementById(_this.itemName + "-button").innerHTML = "&#10084;" + ((_this.price * 100) / 100).toFixed(2); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '8',
            "Increases hps multiplier by 15 for this unit.",
            500, 
            true, 
            function() { return ( 15 ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '9',
            "Increases hps multiplier by amount of this item owned.",
            8000, 
            true, 
            function() { return ( _this.amount ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '10',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemTwo extends MainItem {
   constructor(code) {
      super("How was your sleep?", "ItemTwo", code, 1, 0.005);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "Increases hps multiplier by 0.5 for this unit.",
            2, 
            true, 
            function() { return (0.5); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '2',
            "Increases hps multiplier by 1 for this unit.",
            5, 
            true, 
            function() { return (0.4); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '3',
            "Increases click power by 15% of hps for all items.",
            15, 
            false, 
            function() { return ( perSecondIncrease() * 0.15 ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '4',
            "Total hps for this item increased by 5% per number of this item owned.",
            40, 
            true, 
            function() { return (_this.amount * 0.05); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '5',
            "Increases the click impact by 15%, as well as increase hpc multiplier by 0.5.",
            75, 
            false,
            function() { return (0.5); },
            function() { return (_this.clickImpact +=  0.15); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '6',
            "Increases hps multiplier by 7.5 for this unit.",
            180, 
            true, 
            function() { return (7.5); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '7',
            "Total hps for this item increased by 1% per number of all items owned.",
            1000, 
            true, 
            function() { return (getTotalAmount() * 0.01); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '8',
            "Increases hps multiplier by 20 for this unit.",
            20000, 
            true, 
            function() { return (20); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '9',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemThree extends MainItem {
   constructor(code) {
      super("This took me forever to make,", "ItemThree", code, 150, 0.1);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "Increases hps multiplier by 0.2 for this unit.",
            250, 
            true, 
            function() { return (0.2); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '2',
            "Has a chance to increase hps multiplier for this unit by 1.5 temporarily per second, 0.4 otherwise. NOTE: visual multiplier stops being helpful! Too lazy to fix...",
            550, 
            true, 
            function() { return (Math.round(Math.random() * 10) > 8 ? 1.5 : 0.4); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '3',
            "Gamble! Random chance to increase or decrease the core power by 0.001 per second or do nothing. Also increases hps multiplier by 1.",
            1200, 
            true, 
            function() { let randomNumber = Math.round(Math.random() * 100);
                         randomNumber < 5 ? Math.max(0, _this.power -= 0.001) : randomNumber > 90 ? _this.power += 0.001 : void(0);
                         return 1; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '4',
            "Increases hpc multiplier by 5% of this unit's hps.",
            2500, 
            false, 
            function() { return (_this.amount * _this.power * _this.getMultiplier() * 0.05); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '5',
            "0.1% chance per second to increase click impact by 0.01.",
            5000, 
            false, 
            function() { Math.random() * 1000 < 1 ? _this.clickImpact += 0.01 : void(0);
                         return (0); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '7',
            "Increases hps multiplier by 10 for this unit.",
            100000, 
            true, 
            function() { return (10); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '8',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemFour extends MainItem {
   constructor(code) {
      super("and it might not be the coolest thing,", "ItemFour", code, 1000, 1);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "1",
            "Increases hpc multiplier by 2.",
            2250, 
            false, 
            function() { return (2); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "2",
            "Increases future item costs by 10%, but doubles core power and increases hps by 1.",
            4500, 
            true, 
            function() { return (1); },
            function() { _this.power *= 2;
                         _this.costMultiplier -= 0.1; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "3",
            "Increases future item and upgrade costs by 5%, but increases hps multiplier by 3.",
            7500, 
            true, 
            function() { return (3); },
            function() { _this.costMultiplier -= 0.05; 
                         for (let upgrade of _this.upgradeList) {
                            upgrade.bought == false ? upgrade.price *= 1.05 : void(0);
                            if (upgrade.parentName !== _this.itemName + "" + _this.upgradeList.length) {
                              upgrade.createButton();
                            }
                         }}));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "4",
            "Increases future upgrade costs by 10%, but increases hps multiplier by amount owned.",
            10000, 
            true, 
            function() { return (_this.amount); },
            function() { _this.costMultiplier -= 0.1;
                         for (let upgrade of _this.upgradeList) {
                            upgrade.bought == false ? upgrade.price *= 1.1 : void(0);
                            if (upgrade.parentName !== _this.itemName + "" + _this.upgradeList.length) {
                              upgrade.createButton();
                            }
                         }}));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + "5",
            "Increases future upgrade costs by 5%, but increases hpc multiplier by 5% of item's hps.",
            16000, 
            false, 
            function() { return (_this.amount * _this.power * _this.getMultiplier() * 0.05); },
            function() { _this.costMultiplier -= 0.05;
                         for (let upgrade of _this.upgradeList) {
                            upgrade.bought == false ? upgrade.price *= 1.05 : void(0);
                            if (upgrade.parentName !== _this.itemName + "" + _this.upgradeList.length) {
                              upgrade.createButton();
                            }
                         }}));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '6',
            "Increases future upgrade costs by 5%, but increases click impact by 50% and hps multiplier by 1.5.",
            24000, 
            true, 
            function() { return (1.5); },
            function() { _this.costMultiplier -= 0.05;
                         for (let upgrade of _this.upgradeList) {
                            upgrade.bought == false ? upgrade.price *= 1.05 : void(0);
                            if (upgrade.parentName !== _this.itemName + "" + _this.upgradeList.length) {
                              upgrade.createButton();
                            }
                         }
                         _this.clickImpact += 0.5; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '7',
            "Increases future upgrade costs by 20%, but increases hps multiplier by 20.",
            120000, 
            true, 
            function() { return (20); },
            function() { _this.costMultiplier -= 0.2;
                         for (let upgrade of _this.upgradeList) {
                            upgrade.bought == false ? upgrade.price *= 1.20 : void(0);
                            if (upgrade.parentName !== _this.itemName + "" + _this.upgradeList.length) {
                              upgrade.createButton();
                            }
                         }}));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '8',
            "???",
            800000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemFive extends MainItem {
   constructor(code) {
      super("but I hope you have a happy birthday", "ItemFive", code, 25000, 10);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "Temporal manipulation, decrease the time of a second by 100 milliseconds (quicker everything). Hps multiplier + 1.",
            40000, 
            true, 
            function() { return (1); },
            function() { intervalE -= 100; clearInterval(interval); interval = setInterval(loopfunc, intervalE) }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '2',
            "Total hps for this item increased by 10% per number of all item owned.",
            75000, 
            true, 
            function() { return (getTotalAmount() * 0.1); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '3',
            "Total hps for this item increased by 75% per number of upgrades purchased.",
            100000, 
            true, 
            function() { return (getTotalUpgrades() * 0.75); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '4',
            "Increases click power by 15% of hps for all items.",
            150000, 
            false, 
            function() { return ( perSecondIncrease() * 0.15 ); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "Temporal manipulation, decrease the time of a second by 150 milliseconds (quicker everything).",
            250000, 
            true, 
            function() { return (0); },
            function() { intervalE -= 150; clearInterval(interval); interval = setInterval(loopfunc, intervalE) }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '5',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemSix extends MainItem {
   constructor(code) {
      super("and that that you always remember,", "ItemSix", code, 150000, 1000);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "Admittedly, I'm running out of ideas! Hpc increased by 30% of hps.",
            160000, 
            false, 
            function() { return (_this.amount * _this.power * _this.getMultiplier() * 0.3); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '2',
            "Click impact increased by 100%",
            175000, 
            false, 
            function() { return (0); },
            function() { _this.clickImpact += 1; }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '3',
            "Hps multiplier increased by amount owned.",
            200000, 
            true, 
            function() { return (_this.amount); }));
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '4',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}

class ItemSeven extends MainItem {
   constructor(code) {
      super("no matter what happens,", "ItemSeven", code, 1000000, 99999);
      let _this = this;
      this.upgradeList.push(
         new UpgradeItem(
            this.itemName + '1',
            "???",
            1000000, 
            true, 
            function() { return (0); },
            function() { _this.completeItem() }));
   }
}