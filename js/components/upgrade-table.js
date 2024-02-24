class UpgradeTable extends HTMLElement {

   constructor() {
      super();
      this.isHidden = true;
   }

   connectedCallback() {
      let name = this.getAttribute("child");

      let div = this.generateUpgradesTable(name)

      //console.log(div);
      this.appendChild(div);

      this.hide();
   }

   hide(idName) {
      
      let row = document.getElementById(idName + "-upgrade-row");
      if (row != null)
         row.setAttribute("hidden", this.isHidden);
   }

   show(idName) {
      
      let row = document.getElementById(idName + "-upgrade-row");
      row.removeAttribute("hidden");
   }

   generateUpgradesTable(className) {
      let upgradeDiv = document.createElement("div");
      upgradeDiv.className = "upgrade-container";
      let upgradeList = getItemType(className).upgradeList;
      upgradeDiv.id = className + "-upgrade-container";

      for (let i of upgradeList) {
         if (i.price != 1000000) {
            let appendableButton = i.createButton();
   
            upgradeDiv.appendChild(appendableButton);
         }
      }

      return upgradeDiv;
   }
}

customElements.define("upgrade-table", UpgradeTable);