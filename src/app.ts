import { globalCounter } from "./counter.js";
import { Tracker } from "./tracker.js";

//get tracker elements (.tracker) from the DOM
const trackerElements = Array.from(document.querySelectorAll('.tracker'));

//setup each tracker 
const trackers = trackerElements.map(el => new Tracker(el as HTMLElement));


//subscribe to the global counter to get updates
const totalElement = document.querySelector('.totals');
if (totalElement) {
  globalCounter.subscribe((current) => {
    totalElement.innerHTML = `
      no. of changes: ${current.changed}
      &middot;
      grand total: ${current.value}
      &middot;
      last updated: ${current.updated}
    `
  })
}