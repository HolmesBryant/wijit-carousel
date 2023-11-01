/**
 *  Creates a carousel.
 *	Include equal number of panels and controls.
 *	Controls must have attribute slot='controls'.
 *	The first control affects the first panel, ect.
 *	The panels can also be swiped on touch devices.
 *
 *	@attribute  "auto":Number  	Optional    Autoplay slideshow. The value is the pause between transitions, in seconds.
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
	#repeat = 2;
	#pause = 3;
	#speed = 4;
	#activeclass = 'active';
	shadow = ShadowRoot;
	offset = 0;
	panel;
	slider;
	slides;
	controls;
	next;
	effects = ['slide', 'fade', 'flip'];
	static observedAttributes = ['effect', 'auto', 'repeat', 'pause', 'speed', 'activeclass'];

	constructor() {
		super();
		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.innerHTML = `
		<style>
			:host {
				display: block;
				scroll-behavior: smooth;
				width: 100%;
		    --direction: forwards;
		    --pause: 2;
	  	  --elements: 4;
			}

			::slotted(:not([slot])) {
				display: inline-block;
		    font-size: reset;
		    height: 100%;
		    margin: 0;
		    object-fit: cover;
		    padding: 0;
				scroll-snap-type: x mandatory;
				scroll-snap-align: start;
				scroll-snap-stop: always;
				vertical-align: top;
				width: 100%;
			}

			#container {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: 100%;
				perspective: 1000px;
				position: relative;
			}

			#panel {
				/* Setting overflow breaks flip effect */
				height: 100%;
				overflow: hidden;
				position: relative;
				transition: all 1s;
				transform-style: preserve-3d;
				width: 100%;

		    /* Eliminates margins on inline-block children*/
		    font-size: 0;
			}

			#slider {
				height: 100%;
				white-space: nowrap;

	    	animation-timing-function: ease-in-out;
	    	animation-delay: 0s;
	    	animation-iteration-count: infinite;
	    	animation-direction: forward;
	    	animation-fill-mode: none;
	    	animation-play-state: running;
				height: 100%;
				white-space: nowrap;
			}

			#slider.autoslide {
				animation-name: scroll;
				/*
				animation-duration: calc(1s * var(--pause) * var(--elements));
				*/
			}

			#front,
			#back {
				height: 100%;
				overflow: hidden;
				position: absolute;
				backface-visibility: hidden;
				width: 100%;
			}

			#front {
				transform: rotateY(0deg);
			}

			#back {
				transform: rotateY(180deg);
			}

			.hidden { display: none; }

			/* Touch devices */
			@media (hover: none) {
				.scroller { overflow-x: auto; }
			}
		</style>

		<div id="container">
			<div id="panel" part="panel">
				<div id="slider">
					<slot></slot>
				</div>

				<div id="front" class="hidden">
					<slot name="front"></slot>
				</div>
				<div id="back" class="hidden">
					<slot name="back"></slot>
				</div>
			</div>

			<div id="controls" part="controls">
				<slot name="controls"></slot>
			</div>
		</div>
		`;
	}

	attributeChangedCallback(attr, oldval, newval) {
		this[attr] = newval;
	}

	connectedCallback() {
		this.panel = this.shadow.querySelector('#panel');
		this.slides = Array.from(this.querySelectorAll('*:not([slot=controls])'));
		this.slider = this.shadow.getElementById("slider");
		this.controls = this.querySelectorAll('*[slot=controls]');
		this.initControls();
	}

	initControls() {
		for (let i = 0; i < this.controls.length; i++) {
			// if there are more controls than panels, ignore the extra controls.
			if (!this.slides[i]) continue;

			this.slides[i].setAttribute('data-panel', i);
			this.controls[i].setAttribute('data-target', i);
			this.controls[i].addEventListener('click', evt => {
				if (evt.target.localName !== 'input') evt.preventDefault();
				// if the control was clicked by a human
				if (evt.isTrusted) {
					//Cancel autoplay mode if it is running.
					this.auto = false;
				}

				this.transition(evt);
			});
		}

		this.controls[0].click();
	}

	initFlip() {
		const dupe = this.querySelector('.dupe');
		if (dupe) this.removeChild(dupe);

		this.slides = this.slides || Array.from(this.querySelectorAll('*:not([slot=controls])'));
		this.slider = this.slider || this.shadow.getElementById("slider");
		this.panel = this.panel || this.shadow.querySelector('#panel');
		this.back = this.back || this.shadow.querySelector('#back');
		this.front = this.fron || this.shadow.querySelector('#front');
		this.flipAbortController = new AbortController();

		const current = this.current || this.slides[0];

		current.setAttribute('slot', 'front');
		this.slider.classList.add('hidden');
		this.front.classList.remove('hidden');
		this.back.classList.remove('hidden');
		this.panel.classList.remove('slide');
		this.panel.addEventListener('transitionstart', evt => {
			this.replaceBackface();
		}, {signal: this.flipAbortController.signal} );
	}

	initSlide() {
		const dupe = this.querySelector('.dupe');
		if (dupe) this.removeChild(dupe);

		this.slider = this.slider || this.shadow.getElementById("slider");
		this.slides = this.slides || Array.from(this.querySelectorAll('*:not([slot=controls])'));
		this.panel = this.panel || this.shadow.querySelector('#panel');
		const back = this.shadow.querySelector('#back');
		const front = this.shadow.querySelector('#front');

		if (this.flipAbortController) this.flipAbortController.abort();
		this.panel.classList.add('slide');

		this.slides.forEach (slide => {
			slide.removeAttribute('slot');
		});

		this.slider.classList.remove('hidden');
		front.classList.add('hidden');
		back.classList.add('hidden');

	}

	initAutoSlide() {
		// If user prefers reduced motion, don't animate.
		if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
			console.warn('AutoPlay is disabled because of setting: "prefers-reduced-motion"');
			this.initSlide();
			return;
		}

		const style = this.shadow.querySelector('style');
		const numKeyframes = this.slides.length;
		const step = 100 / numKeyframes;
		let css =`\n@keyframes scroll {\n`;

		for (let i = 0; i <= numKeyframes; i++) {
			const kstep = step * i;
			const keya = `${kstep}%`;
			const keyb = (kstep === 100) ? '' : `, ${kstep + 20}%`;
			const translate = (i === 0) ? '0' : `-${100 * i}%`;
			css += `${keya} ${keyb} { transform: translate(${translate}); }\n`;
		}

		css += `}`;
		const textNode = document.createTextNode(css);
		style.prepend(textNode);

		const dupe = this.slides[0].cloneNode(true);
		dupe.removeAttribute('id');
		dupe.removeAttribute('data-panel');
		dupe.classList.add('dupe');
		this.append(dupe);

		const duration = this.pause * numKeyframes;
		this.slider.addEventListener('animationstart', (evt) => {
			const delay = this.pause * 1000;
			let counter = 1;
			this.interval = setInterval (() => {
				const controlIdx = counter % this.controls.length;
				this.controls[controlIdx].click();
				counter++;
			}, delay);
		});

		let iteration = 1;
		this.slider.addEventListener('animationiteration', (evt) => {
			console.log(iteration);
			if (iteration == this.repeat) {
				this.slider.classList.remove('autoslide');
				clearInterval(this.interval);
			}

			iteration++;
		});

		this.slider.classList.add('autoslide');
		// console.log(this.pause, numKeyframes, duration)
		this.slider.style.animationDuration = `${duration}s`;
	}

	transition(event) {
		if (this.auto) return;

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

	slideEffect (evt, smooth = true) {
		this.slider.classList.remove('autoslide');
		if (!evt.isTrusted) return;

		const target = evt.target.getAttribute('data-target');
		const left = this.slides[target].offsetLeft;
		const adjust = this.slides[0].offsetLeft;
		const offset = left - adjust;

		this.panel.scroll({
			top: 0,
			left: offset,
			behavior: 'smooth'
		});

		this.controls.forEach ( (control, idx) => {
			if (target == idx) {
				control.classList.add(this.activeclass);
			} else {
				control.classList.remove(this.activeclass);
			}
		});
	}

	fadeEffect (evt, pause = 650, smooth) {
		this.slider.classList.remove('autoslide');
		this.panel.style.opacity = '0.0';
		setTimeout ( () => {
			this.slideEffect(evt, smooth);
			setTimeout( () => {
				this.panel.style.removeProperty('opacity');
			}, pause)
		}, pause);
	}

	/**
	 * Flip slides horizontally or vertically
	 * @param  {Event} event A click event
	 * @return {Void}
	 */
	flipEffect(event) {
		this.slider.classList.remove('autoslide');
		const target = event.target.getAttribute('data-target');
		this.next = this.slides[target];
		this.current = this.next;
		const currentRotation = this.getTransformValue(this.panel.style.transform);
		const rotate = currentRotation + 180;
		this.panel.style.transform = `rotateY(${rotate}deg)`;
	}

	replaceBackface(evt) {
		const currentRotation = this.getTransformValue(this.panel.style.transform);
		const pause = (this.pause * 1000) / 2;
		const frontElem = this.querySelector('*[slot=front]');
		const backElem = this.querySelector('*[slot=back]');

		if ((currentRotation/180) % 2 === 1) {
			// Front is facing out, replace the back
			if (backElem) backElem.removeAttribute('slot');
			this.next.setAttribute('slot', 'back');
		} else {
			// Back is facing out, replce the front
			if (frontElem) frontElem.removeAttribute('slot');
			this.next.setAttribute('slot', 'front');
		}
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

	autoPlay () {
		let control;
		let counter = 0;
		const pause = this.pause * 1000;
		const panels = [...this.querySelectorAll('*:not([slot=controls])')];
		const repeat = panels.length * this.repeat;
		const interval = setInterval (() => {
			if (this.auto === false) {
				clearInterval (interval);
			} else if (counter < repeat || repeat === 0) {
				// auto is true
				if (this.effect !== 'slide') {
					const controlIdx = counter % this.controls.length;
					control = this.controls[controlIdx];
					control.click();
					counter++;
				} else {
					// effect is 'slide'
					clearInterval (interval);
					this.initAutoSlide();
				}

			} else {
				clearInterval (interval);
			}
		}, pause)
	}

	autoSlide() {

	}

	get effect () { return this.#effect; }
	set effect (value) {
		this.#effect = value;
		if (value === 'flip') {
			this.initFlip();
		} else {
			this.initSlide();
		}
	}

	get auto () { return this.#auto; }
	set auto (value) {
		this.#auto = (value === 'true') ? true : false;
		// if (this.#auto) this.autoPlay(value);
		if (this.#auto) this.autoPlay(value);
	}

	get repeat () { return this.#repeat; }
	set repeat (value) {
		this.#repeat = value;
	}

	get pause () { return this.#pause; }
	set pause (value) {
		this.#pause = value;
	}

	get speed () { return isNaN(this.#speed) ? this.#speed : this.#speed + 's'; }
	set speed (value) {
		this.#speed = value + 's';
	}

	get activeclass () { return this.#activeclass; }
	set activeclass (value) {
		this.#activeclass = value;
	}
}

document.addEventListener('DOMContentLoaded', customElements.define('wijit-carousel', WijitCarousel));
