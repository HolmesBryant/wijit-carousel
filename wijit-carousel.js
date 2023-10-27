/**
 *  Creates a carousel.
 *	Include equal number of panels and controls.
 *	Controls must have attribute slot='controls'.
 *	The first control affects the first panel, ect.
 *	The panels can also be swiped on touch devices.
 *
 *	@attribute  "auto":Number  	Optional    Autoplay slideshow. The value is the delay between transitions, in seconds.
 *	@attribute: "repeat":Number	Optional	Number of cycles to repeat the slide show. Enter "0" (default) for infinite repetition.
 *
 *	@example:
 *	<wijit-carousel auto="true" repeat="4">
 *	    <div>Panel One</div>
 *	    <div>Panel Two</div>
 *	    <input slot="controls" type="radio" name="carousel">
 *	    <input slot="controls" type="radio" name="carousel">
 *	</wijit-carousel>
 *
 * attrs
 * perspective
 * effect
 *
 */
export class WijitCarousel extends HTMLElement {
	#auto = false;
	#repeat = 0;
	#delay = 4;
	#effect = 'fade';
	panelheight = '400px';
	activeClass = 'active';
	shadow = ShadowRoot;
	panels = [];
	controls = [];
	container = HTMLElement;
	rotations = 0;
	effects = ['slide', 'fade', 'flip'];
	static observedAttributes = ['auto', 'repeat'];

	constructor() {
		super();
		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.innerHTML = `
			<style>
			:host {
				display: block;
				scroll-behavior: smooth;
			}

			::slotted(aside) {
				display: inline-block;
				overflow-y: hidden;
				scroll-snap-type: x mandatory;
				scroll-snap-align: start;
				scroll-snap-stop: always;
				width: 100%;
			}

			#container {
				padding: inherit;
				position: relative;
				perspective: 1000px;
				width: 100%;
				height: 100%;
			}

			#panels {
				height: ${this.panelheight};
				opacity: 1.0;
				position: relative;
				scrollbar-width: none;
				scroll-snap-type: x mandatory;
				transform-style: preserve-3d;
				transition: all .5s;
				width: 99%;
				white-space: nowrap;
			}

			/*#panels::-webkit-scrollbar {
				display: none;
			}*/

			#front {
				transform: rotateY(0deg);
			}

			#back {
				transform: rotateY(180deg);
			}

			#front,
			#back
			{
				width: 100%;
				height: 100%;
				position: absolute;
				backface-visibility: hidden;

			}

			#controls {
				margin-top: 1rem;
				text-align: center;
			}


			/* Touch devices */
			@media (hover: none) {
				.scroller { overflow-x: auto; }
			}

			</style>
			<div id="controls">
				<slot name="controls"></slot>
			</div>
		`;
	}

	attributeChangedCallback(attr, oldval, newval) {
		this[attr] = newval;
	}

	connectedCallback() {
		this.effect = this.getAttribute('effect') || this.effect;
		const controls = this.shadow.querySelector('#controls');
		this.wrapPanels();

		if (this.effect === 'flip') {
			this.shadow.insertBefore(this.flipTemplate(), controls);
		} else {
			this.shadow.insertBefore(this.scrollTemplate(), controls);
		}

		this.initControls();
		if (this.auto) this.autoPlay();
	}

	/**
	 * Wrap each direct child that is not a control inside an <aside> element
	 * and add each resulting aside to this.panels.
	 * @return {[type]} [description]
	 */
	wrapPanels() {
		const panels = [...this.children].filter (item => !item.hasAttribute('slot'));
		const aside = document.createElement('aside');
		const frag = document.createDocumentFragment();
		let wrapper;

		panels.forEach (panel => {
			if (panel.localName === 'aside') {
				wrapper = panel;
			} else {
				wrapper = aside.cloneNode();
				wrapper.append(panel);
			}
			this.panels.push(wrapper);
			frag.append(wrapper);
		});

		this.append(frag);
	}

	initControls() {
		this.controls = [...this.children].filter (item => item.getAttribute('slot') === 'controls');
		for (let i = 0; i < this.controls.length; i++) {
			// if there are more controls than panels, ignore the extra controls.
			if (!this.panels[i]) continue;

			this.panels[i].setAttribute('data-panel', i);
			this.controls[i].setAttribute('data-target', i);
			this.controls[i].addEventListener('click', evt => {
				if (evt.target.localName !== 'input') evt.preventDefault();
				this.resetControls(evt);
				this.transition(evt);
			});
		}
	}

	resetControls(event) {
		for (const control of this.controls) {

			if (control !== event.target) {
				// in case some controls are <option>
				control.selected = false;
				// in case some controls are form inputs
				control.checked = false;
			}
		}
	}

	transition(event) {
		switch (this.effect) {
		case 'slide':
			this.scrollEffect(event);
			break;
		case 'flip':
			this.flipEffect(event);
			break;
		default:
			this.fadeEffect(event);
			break;
		}
	}

	scrollEffect (evt, smooth = true) {
		smooth = true ? 'smooth' : 'instant';
		const options = {behavior:smooth, block:'nearest', inline:'nearest'};
		const target = evt.target.getAttribute('data-target');
		const panels = this.shadow.querySelector('#panels');

		panels.style.overflow = 'hidden';
		this.panels[target].scrollIntoView(options);

		this.controls.forEach ( (control, idx) => {
			const target = evt.target.getAttribute('data-target');
			if (target == idx) {
				control.classList.add(this.activeClass);
			} else {
				control.classList.remove(this.activeClass);
			}
		});

	}

	fadeEffect (evt, delay = 650, smooth) {
		const delay2 = delay - 100;
		const panels = this.shadow.querySelector('#panels');
		panels.style.opacity = '0.0';
		setTimeout ( () => {
			this.scrollEffect(evt, smooth);
			setTimeout( () => {
				panels.style.removeProperty('opacity');
			}, delay)
		}, delay2);
	}

	/**
	 * Flip slides horizontally or vertically
	 * @param  {Event} event A click event
	 * @return {Void}
	 */
	flipEffect(event) {
		const panelsElem = this.shadow.querySelector('#panels');
		const target = event.target.getAttribute('data-target');
		const next = this.panels[target];
		const currentRotation = this.getTransformValue(panelsElem.style.transform);
		const rotate = currentRotation + 180;
		this.rotations++;

		if (this.rotations % 2 === 1) {
			next.setAttribute('slot', 'back');
			const front = this.querySelector('*[slot=front]');
			setTimeout ( () => {
				front.removeAttribute('slot');
			}, 500);
		} else {
			next.setAttribute('slot', 'front');
			const back = this.querySelector('*[slot=back]');
			setTimeout ( () => {
				back.removeAttribute('slot');
			}, 500);
		}

		panelsElem.style.transform = `rotateY(${rotate}deg)`;
	}

	getTransformValue(transformValue) {
		let ret = 0;
		if (transformValue) {
			const re = /(\d+)(\w+)/;
			const matches = transformValue.match(re);
			ret = parseInt(matches[1]);
		}

		return ret;
	}

	scrollTemplate() {
		const template = `
		<div id="container">
			<div id="panels">
				<slot></slot>
			</div>
		</div>
		`;

		return document.createRange().createContextualFragment(template);
	}

	flipTemplate() {
		const template = `
		<div id="container">
			<div id="panels" part="panels">
				<div id="front">
					<slot name="front"></slot>
				</div>
				<div id="back">
					<slot name="back"></slot>
				</div>
			</div>
		</div>
		`;

		const frag = document.createRange().createContextualFragment(template);

		this.panels[0].setAttribute('slot', 'front');

		return frag;
	}

	autoPlay () {
		let control;
		let counter = 1;
		const delay = this.delay * 1000;
		const repeat = this.panels.length * this.repeat;
		const interval = setInterval (() => {
			if (counter < repeat || repeat === 0) {
				const controlIdx = counter % this.controls.length;
				control = this.controls[controlIdx];
				control.click();
				counter++;
			} else {
				clearInterval (interval);
			}
		}, delay)
	}

	get auto () { return this.#auto; }
	set auto (value) {
		if (value == 'true') {
			this.#auto = true;
		} else {
			this.#auto = false;
		}

		if (this.#auto && this.panels.length > 0) {
			this.autoPlay(value);
		}
	}

	get repeat () { return this.#repeat; }
	set repeat (value) {
		this.#repeat = value;
	}

	get delay() { return this.#delay; }
	set delay(value) {
		this.#delay = value;
	}

	get effect () { return this.#effect; }
	set effect (value) {
		this.#effect = value;
	}
}

document.addEventListener('DOMContentLoaded', customElements.define('wijit-carousel', WijitCarousel));
