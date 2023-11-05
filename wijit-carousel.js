/**
 *  Creates a carousel.
 *	Include equal number of panels and controls.
 *	Controls must have attribute slot='controls'.
 *	The first control affects the first panel, ect.
 *	The panels can also be swiped on touch devices.
 *
 *	@attribute  "auto":Boolean  	Optional    Autoplay slideshow. The value is the pause between transitions, in seconds.
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
	#effect = 'fade';
	#auto = false;
	#repeat = 0;
	#pause = 3;
	#speed = 1;
	#activeclass = 'active';
	shadow = ShadowRoot;
	panel;
	slider;
	slides;
	controls;
	transitionRunning = false;
	effects = ['slide', 'fade', 'flip'];
	static observedAttributes = ['effect', 'auto', 'repeat', 'pause', 'activeclass'];

	constructor() {
		super();
		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.innerHTML = `
		<style>
			:host {
				display: block;
				height: 100%;
				scroll-behavior: smooth;
				width: 100%;
			}

			::slotted([slot=carda]),
			::slotted([slot=cardb]) {
				height: 100%;
				width: 100%;
				object-fit: cover;
			}

			/*::slotted(:not([slot])) {
		    	font-size: reset;
				scroll-snap-type: x mandatory;
				scroll-snap-align: start;
				scroll-snap-stop: always;
			}*/

			#container {
				all: inherit;
				align-items: center;
				border-radius: inherit;
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow: hidden;
				perspective: 1000px;
				position: relative;
			}

			#panel {
				all: inherit;
				display: block;
				height: 100%;
				overflow: visible;
				position: relative;
				transition-duration: ${this.speed}s;
				transition-property: all;
				transition-timing-function: ease-in-out;
				transform-style: preserve-3d;
				white-space: nowrap;
				width: 100%;
			}

			#container.flip {
				overflow: unset;
			}

			#container.flip #carda,
			#container.flip #cardb {
				height: 100%;
				overflow: hidden;
				position: absolute;
				backface-visibility: hidden;
				width: 100%;
			}

			#container.flip #carda { transform: rotateY(0deg); }
			#container.flip #cardb { transform: rotateY(180deg); }

			#carda,
			#cardb {
				border-radius: inherit;
				display: inline-block;
				height: 100%;
				overflow: hidden;
				vertical-align: top;
				width: 100%;
			}

			#controls { display: flex; }

			.hidden { display: none; }

			/* Touch devices */
			@media (hover: none) {
				.scroller { overflow-x: auto; }
			}
		</style>

		<div id="container" part="container">
			<div id="panel" part="panel">
				<div id="carda" part="card"><slot name="carda"></slot></div>
				<div id="cardb" part="card"><slot name="cardb"></slot></div>
			</div>
			<div id="controls" part="controls">
				<slot name="controls"></slot>
			</div>
		</div>
		<div id="slides" class="hidden" aria-hidden="true"><slot></slot></div>
		`;
	}

	attributeChangedCallback(attr, oldval, newval) {
		this[attr] = newval;
	}

	connectedCallback() {
		this.container = this.shadow.querySelector('#container');
		this.panel = this.shadow.querySelector('#panel');
		this.cardA = this.shadow.querySelector('#carda');
		this.cardB = this.shadow.querySelector('#cardb');
		this.slides = [...this.children].filter (item => !item.hasAttribute('slot'));
		this.controls = this.querySelectorAll('*[slot=controls]');
		this.effect = this.getAttribute('effect') || this.effect;

		// this.panel.style.transitionDuration = `${this.speed}s`;
		this.slides[0].setAttribute('slot', 'carda');
		this.initControls();
	}

	initControls() {
		for (let i = 0; i < this.controls.length; i++) {
			// if there are more controls than panels, ignore the extra controls.
			if (!this.slides[i]) continue;
			this.slides[i].setAttribute('data-panel', i);
			this.controls[i].setAttribute('data-target', i);
			this.controls[i].addEventListener('click', evt => {
				// preventDefault() prevents inputs from being auto focused;
				if (evt.target.localName !== 'input') evt.preventDefault();

				// if the control was clicked by a human, turn off autoPlay
				if (evt.isTrusted) {
					//Cancel autoplay mode if it is running.
					this.auto = false;
				}
				this.transition(evt);
			});
		}
	}

	async transition(event) {
		this.disableControlsDuringTransition();

		switch (this.effect) {
		case 'slide':
			this.slideEffect(event);
			break;
		case 'flip':
			this.flipEffect(event);
			break;
		default:
			this.fadeEffect(event);
			break;
		}
	}

	disableControlsDuringTransition() {
		const delay = this.speed * 1000;
		for (const control of this.controls) {
			control.disabled = true;
			control.classList.add('disabled');
		}

		setTimeout (() => {
			for (const control of this.controls) {
				control.disabled = false;
				control.classList.remove('disabled');
			}
		}, delay);
	}

	waitForPropertyValue(property, desiredValue) {
		return new Promise(resolve => {
			const checkPropertyValue = () => {
				if (this[property] === desiredValue) {
					resolve(true);
				} else {
					setTimeout(checkPropertyValue, 100);
				}
			};

			checkPropertyValue();
  		});
	}

	slideEffect (evt, smooth = true) {
		const idx = evt.target.getAttribute('data-target');
		const offset = this.panel.children[1].offsetLeft;
		const distance = `-${offset}px`;
		const delay = (smooth) ? this.speed * 1000 : 0;
		const nextSlot = this.panel.children[1].querySelector('slot').name;
		const currentSlot = (nextSlot === 'carda') ? 'cardb' : 'carda';
		const currentElem = this.querySelector(`*[slot=${currentSlot}]`);

		if (this.slides[idx] === currentElem) return;
		this.slides[idx].setAttribute('slot', nextSlot);
		this.panel.style.translate = distance;
		setTimeout (() => {
			this.panel.style.transitionDuration = '0s';
			this.panel.append(this.panel.children[0]);
			this.panel.style.translate = 0;
			this.slides.forEach (slide => {
				if (slide !== this.slides[idx]) {
					slide.removeAttribute('slot');
				}
			});

			if (!smooth) this.panel.style.removeProperty('transition-duration');

		}, delay);

			this.panel.style.removeProperty('transition-duration');
	}

	fadeEffect (evt, smooth = false) {
		const idx = evt.target.getAttribute('data-target');
		const delay = this.speed * 1000;

		this.panel.style.opacity = '0.0';
		setTimeout (() => {
			this.slideEffect(evt, false)
			this.panel.style.opacity = '1.0';
		}, delay);
	}

	/**
	 * Flip slides horizontally or vertically
	 * @param  {Event} event A click event
	 * @return {Void}
	 */
	flipEffect(evt) {
		const currentRotation = this.getTransformValue(this.panel.style.transform);
		const rotate = currentRotation + 180;
		const delay = this.speed * 1000;
		const idx = evt.target.getAttribute('data-target');
		const modulus = (currentRotation / 180) % 2;
		const currentSlot = (modulus === 0) ? 'carda' : 'cardb';
		const nextSlot = (modulus === 0) ? 'cardb' : 'carda';
		const currentElem = this.querySelector(`*[slot=${currentSlot}]`);

		if (this.slides[idx] === currentElem) return;
		this.slides[idx].setAttribute('slot', nextSlot);
		this.panel.style.transform = `rotateY(${rotate}deg)`;

		setTimeout (() => {
			this.slides.forEach (slide => {
				if (slide !== this.slides[idx]) {
					slide.removeAttribute('slot');
				}
			})
		}, delay)
	}

	startAuto() {
		let i = 1;
		const delay = this.pause * 1000;

		this.autoInterval = setInterval (() => {
			const idx = i % this.controls.length;
			this.controls[idx].click();
			i++;
		}, delay);
	}

	stopAuto() {
		clearInterval(this.autoInterval);
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

	get effect () { return this.#effect; }
	set effect (value) {
		this.#effect = value;
		const delay = this.speed * 1000;
		this.panel.style.opacity = '0.0';
		if (this.panel.style.transform) this.panel.style.transform = 'rotateY(0deg)';

		switch (value) {
		case 'slide':
			setTimeout (() => {
				this.container.classList.remove('flip');
				this.panel.style.removeProperty('opacity');
			}, delay);
			break;

		case 'flip':
				const del = delay;
			setTimeout (() => {
				this.panel.style.transitionDuration = `${this.speed}s`;
				this.container.classList.add('flip');
				this.panel.style.removeProperty('opacity');
			}, del);
			break;

		default:
			this.panel.style.transitionDuration = `${this.speed}s`;
			setTimeout (() => {
				this.container.classList.remove('flip');
				this.panel.style.removeProperty('opacity');
			}, delay);
			break;
		}
	}

	get auto () { return this.#auto; }
	set auto (value) {
		// if value is 'true' or elem has auto attr without a value
		this.#auto = (value === 'true' || value === '') ? true : false;
		if (this.#auto) {
			this.startAuto();
		} else {
			this.stopAuto();
		}
	}

	get repeat () { return this.#repeat; }
	set repeat (value) {
		value = parseInt(value);
		console.log('repeat', value);
		this.#repeat = value;
	}

	get pause () { return this.#pause; }
	set pause (value) {
		value = parseFloat(value);
		this.#pause = value;
		console.log('pause', value);
	}

	get speed () { return this.#speed; }
	set speed (value) {
		value = parseFloat(value);
		this.#speed = value;
		console.log('speed', value);
	}

	get activeclass () { return this.#activeclass; }
	set activeclass (value) {
		console.log('activeclass', value);
		this.#activeclass = value;
	}
}

document.addEventListener('DOMContentLoaded', customElements.define('wijit-carousel', WijitCarousel));
