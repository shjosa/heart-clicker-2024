class StoreItem extends HTMLElement {

   constructor() {
      super();
   }

   connectedCallback() {
      var name = this.getAttribute("id");

      console.log(name);

      var itemData = getItemType(name);

      var dataTable = document.createElement("table");
      

      var expandUpgradesButton = document.createElement("button");
      expandUpgradesButton.id = itemData.itemName + "-expand";
      expandUpgradesButton.innerHTML = "v";
      

      var itemLabel = this.generateStoreListingTable(itemData);
      var buyButton = document.createElement("button");
      buyButton.id = itemData.itemName + "-button";
      buyButton.innerHTML = "&#10084;" + ((itemData.price * 100) / 100).toFixed(2);
      buyButton.onclick = function() { itemData.buy() };

      var upgradeContainer = document.createElement("upgrade-table");
      upgradeContainer.setAttribute("child", itemData.itemName);

      
      var tr = dataTable.insertRow();
      tr.id = itemData.itemName + "shop-row"
      tr.style.height = "80px";
      var td = tr.insertCell();
      td.appendChild(expandUpgradesButton);
      td.setAttribute("colspan", "1");
      td = tr.insertCell();
      td.appendChild(itemLabel);
      td.setAttribute("colspan", "3");
      td.className = "store-item-text"
      td = tr.insertCell();
      td.appendChild(buyButton);
      td.setAttribute("colspan", "1");
      
      tr = dataTable.insertRow();
      tr.id = itemData.itemName + "-upgrade-row";
      tr.style.height = "fit-content";
      tr.setAttribute("hidden", upgradeContainer.isHidden);
      td = tr.insertCell();
      td.setAttribute("colspan", "5");
      td.appendChild(upgradeContainer);


      let _this = this;
      expandUpgradesButton.onclick = function() { 
         upgradeContainer.isHidden = !upgradeContainer.isHidden;

         if (upgradeContainer.isHidden) {
            upgradeContainer.hide(itemData.itemName);
            expandUpgradesButton.innerHTML = "v";
            _this.style.height = "80px";
         } else {
            upgradeContainer.show(itemData.itemName);
            expandUpgradesButton.innerHTML = "^";
            _this.style.height = "160px";
         }
      };

      this.appendChild(dataTable);
   }

   generateStoreListingTable(itemData) {
      let storeListing = document.createElement("table");

      let tr = storeListing.insertRow();
      let td = tr.insertCell();
      td.id = itemData.itemName + "-listing-name";
      td.setAttribute("colspan", "3");
      td.innerHTML = itemData.flavorName + " x " + itemData.amount;

      td = tr.insertCell();
      td.id = itemData.itemName + "-hps";
      td.setAttribute("colspan", "2");
      td.innerHTML = ((itemData.power * itemData.amount * itemData.getMultiplier() * 100) / 100).toFixed(3) + " hps";

      td = tr.insertCell();
      td.id = itemData.itemName + "-hps-multiplier";
      td.innerHTML = "x" + ((itemData.getMultiplier() * 100) / 100).toFixed(2);

      return storeListing;
   }
}

customElements.define("store-item", StoreItem);