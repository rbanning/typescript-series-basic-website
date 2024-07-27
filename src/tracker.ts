import { globalCounter } from "./counter.js";

export class Tracker {
  private _wrapper!: HTMLElement;
  private _button: HTMLButtonElement | null;
  private _output: HTMLElement | null;

  private key!: string;
  private delta: number = 0;

  private duration: number = 0;
  private frequency: number = 0;

  private readonly cachedStyles: Record<string, string> = {};

  constructor(wrapper: HTMLElement) {
    this._wrapper = wrapper;
    this._button = wrapper.querySelector('button');
    this._output = wrapper.querySelector('.output');

    this.key = wrapper.dataset["key"] ?? '';
    this.delta = parseFloat(wrapper.dataset["delta"] ?? '0');
    this.duration = parseInt(wrapper.dataset["duration"] ?? '0');
    this.frequency = parseInt(wrapper.dataset["frequency"] ?? '100000');

    //only continue if everything is valid
    if (this._button && this._output && this.key) {
      //todo: attach button to a special click listener that differentiate btw 
      //      regular click => increment()
      //      double  click => increment(-1 * this.delta)
      //      long    click => reset()
      this._button.addEventListener('click', () => this.increment());
      this.initializeWrapperState();
      this.log(`The ${this.key} tracker has been initialized!`);
    }
    else {
      console.warn("There was a problem loading a tracker", {wrapper, check: this});
    }
  }

  increment(amt?: number) {
    amt ??= this.delta;
    const current = globalCounter.add(this.key, amt).get(this.key);
    this.log(
      `${this.key} has been updated ${current.changed} time${current.changed === 1 ? '' : 's'}`,
      `The new total is ${current.value}`,
      `Updated: ${current.updated}`
    );
  } 

  reset() {
    const current = globalCounter.reset(this.key).get(this.key);
    this.log(
      `${this.key} has been reset`,
      `The new total is ${current.value}`,
      `Updated: ${current.updated}`
    );
  }

  private log(...args: string[]) {
    if (this._output) {
      this._output.innerHTML = `<p>${args.join('</p><p>')}</p>`;
    }
  }

  private initializeWrapperState() {
    //disable the button
    if (this._button) { this._button.disabled = true; }

    //start timer
    setTimeout(() => {
      this.activate();
    }, this.frequency);
  }

  private setStyle(key: string, value: string) {
    if (!(key in this.cachedStyles)) {
      //save the existing property value
      this.cachedStyles[key] = this._wrapper.style.getPropertyValue(key);
    }
    this._wrapper.style.setProperty(key, value);
  }
  private resetStyles() {
    Object.keys(this.cachedStyles).forEach(key => {
      this._wrapper.style.setProperty(key, this.cachedStyles[key]);
    })
  }

  private activate() {
    //add active visual status
    this.setStyle('border-color', this.key);
    this.setStyle('background-color', `color-mix(in srgb, ${this.key} 20%, transparent)`);
    this.setStyle('box-shadow', `1px 3px 5px color-mix(in srgb, ${this.key} 30%, transparent)`);
    
    //enable the button
    if (this._button) { this._button.disabled = false; }


    setTimeout(() => {
      this.deactivate();
    }, this.duration);
  }

  private deactivate() {
    //remove active visual status
    this.resetStyles();

      //disable button
    if (this._button) { this._button.disabled = true; }

    setTimeout(() => {
      this.activate();
    }, this.frequency);
  }

}