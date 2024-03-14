/**
 * A web component that creates a carousel with a variety of effects.
 * Include equal number of panels and controls.
 * Controls must have attribute slot='controls'.
 * The first control activates the first panel, ect.
 * Controls are optional. You don't have to include them if you don't want them.
 * The panels can also be swiped on touch devices.
 *
 * @author Holmes Bryant <https://github.com/HolmesBryant>
 * @license GPL-3.0
 *
 * @property {string} effect - The effect to use for the carousel. Valid values are "slide", "fade", and "flip".
 * @property {boolean} auto - Whether to automatically play the carousel.
 * @property {number} repeat - The number of times to repeat the carousel.
 * @property {number} speed - The speed of the carousel in seconds.
 * @property {number} pause - The pause between slides in seconds.
 *
 *	@example:
 *	<wijit-carousel>
 *	    <div>Panel One</div>
 *	    <img src="Panel_Two.jpg">
 *
 * 			<!-- optional -->
 *	    <input slot="controls" type="radio" name="carousel">
 *	    <input slot="controls" type="radio" name="carousel">
 *	</wijit-carousel>
 */
export class WijitCarousel extends HTMLElement {
	/**
	 * An abort controller attached to all event listeners
	 * @private
	 * @type {AbortController}
	 */
	#abortcontroller = new AbortController();

	#clickAutoAbortcontroller;

	/**
	 * The attribute name to add to the control which corresponds to the currently visible slide.
	 * @public
	 * @type {string}
	 */
	activeindicator = 'active';

	/**
	 * Determines if slideshow is paused when user clicks on a controls or on the slide itself
	 * @private
	 * @type {boolean}
	 * @remarks Has public getter and setter
	 */
	#clickplay = false;

	/**
	 * Whether to make the automatically generated controls visible
	 * @private
	 * @type {boolean}
	 * @remarks Has public getter and setter
	 */
	#controls = false;

	/**
	 * Whether to automatically play the carousel.
	 * @private
	 * @type {boolean}
	 * @remarks Has public getter and setter
	 */
	#autoplay = false;

	/**
	 * The available effects for the carousel.
	 * @private
	 * @type {string[]}
	 */
	#effects = ['fade', 'flip', 'slide', 'slip'];

	/**
	 * The current effect being used.
	 * @private
	 * @type {string}
	 * @remarks Has public getter and setter
	 */
	#effect = 'slide';

	/**
	 * The pause between slides in seconds.
	 * @private
	 * @type {integer|float}
	 * @remarks Has public getter and setter
	 */
	#pause = 3;

	/**
	 * The number of times to repeat the carousel. 0 means repeat infinitly.
	 * @private
	 * @type {integer}
	 * @remarks Has public getter and setter
	 */
	#repeat = 0;

	/**
	 * The speed of each transition in seconds.
	 * @private
	 * @type {integer|float}
	 * @remarks Has public getter and setter
	 */
	#speed = 1;

	/**
	 * The slot holding the visible slide
	 * @private;
	 * @type {String}
	 */
	#currentSlot = 'carda';

	/**
	 * The current iteration of the carousel. Used for autoPlay
	 * @private
	 * @type {integer}
	 */
	#slideNum = 1;

	/**
	 * Array holding the controls for the carousel
	 * @private
	 * @type {Array}
	 */
	#carouselControls = [];

	/**
	 * An array of attributes to observe for changes.
	 * @static
	 */
	static observedAttributes = ['autoplay', 'clickplay', 'controls', 'effect', 'pause', 'repeat', 'speed'];

	/**
	 * Constructs a new WijitCarousel instance.
	 */
	constructor() {
		super();
		this.attachShadow( { mode:'open' } );
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					--container-height: 100%;
					--control-height: 50px;
					--overflow: hidden;
					--panel-height: auto;
					--perspective: 1800px;
					--perspective-origin: center;
					--speed: ${this.speed}s;
					--transition-timing: ease;
					display: block;
				}

				.hidden {
					display: none;
				}

				#container {
					display: grid;
					grid-template-rows: 1fr var(--control-height);
					height: var(--container-height);
					transition: all .5s;
				}

				#panel {
					height: var(--panel-height);
					opacity: 1;
					overflow: hidden;
					position: relative;
          transform-style: preserve-3d;
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
					white-space: nowrap;
					width: 100%;
					perspective: var(--perspective);
					perspective-origin: var(--perspective-origin);
				}

				#panel.fade-out {
					opacity: 0;
				}

				#panel.flipped {
					overflow: visible;
					z-index: 1000;
				}

				#panel.flipped #carda,
				#panel.flipped #cardb {
          backface-visibility: hidden;
					height: 100%;
          position: absolute;
          width: 100%;
				}

				#panel.a.flipped #cardb {
					transform: rotateY(-180deg);
				}

				#panel.b.flipped #carda {
					transform: rotateY(-180deg);
				}

				#panel.a.flip #carda {
					transform: rotateY(180deg);
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
				}

				#panel.a.flip #cardb {
					transform: rotateY(0deg);
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
				}

				#panel.b.flip #carda {
					transform: rotateY(0deg);
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
				}

				#panel.b.flip #cardb {
					transform: rotateY(180deg);
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
				}

				#panel.slide-left #carda,
				#panel.slide-left #cardb {
					left: -100%;
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
				}

				#panel.b.slip-left #carda {
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
					width: 0%;
				}

				#panel.a.slip-left #cardb {
					transition: all var(--speed);
					transition-timing-function: var(--transition-timing);
					width: 0%;
				}

				#carda,
				#cardb {
					display: inline-block;
					height: 100%;
					left: 0;
					overflow: var(--overflow);
					position: relative;
					text-align: center;
					vertical-align: top;
					white-space: wrap;
					width: 100%;
				}

				#controls {
					text-align: center;
				}

				/* Touch devices */
				/*@media (hover: none) {
					.scroller { overflow-x: auto; }
				}*/
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
			<div hidden id="slides" class="hidden"><slot></slot></div>
			`;
	}

	/**
	 * Called when an attribute of the custom element changes.
	 *
	 * @param {string} attr The name of the attribute that changed.
	 * @param {string} oldval The old value of the attribute.
	 * @param {string} newval The new value of the attribute.
	 */
	attributeChangedCallback( attr, oldval, newval ) {
		this[attr] = newval;
	}

	/**
	 * Called after the custom element is inserted into the document.
	 */
	connectedCallback() {
		this.slides = Array.from( this.children ).filter( current => !current.hasAttribute( 'slot' ) );
		let controls = this.querySelectorAll( '*[slot=controls]' );
		if ( this.slides ) this.initSlides( this.slides );
		if ( controls.length === 0 ) controls = this.createControls();
		this.#carouselControls = this.initControls( controls );
	}

	disconnectedCallback() {
		this.#abortcontroller.abort();
	}

	/**
	 * Initialize slides.
	 * @param  {array} slides - Array of HTML elements
	 * @return {array}        - The array of slides with 'data-slide' set
	 *
	 * @test const slides = [document.createElement('img')];
	 		self.initSlides(slides).length === 1 // true
	 */
	initSlides( slides ) {
		let i = 0;
		slides[0].setAttribute('slot', 'carda');

		for ( i; i < slides.length; i++ ) {
			slides[i].setAttribute( 'data-slide', i);
			if ( this.clickplay ) this.addClickAutoListener( slides[i] );
		}

		return slides;
	}

	addClickAutoListener( slide ) {
		slide.addEventListener( 'click' , event => {
			if (
				event.target.localName == 'input'
				|| event.target.localName == 'select'
				|| event.target.localName == 'textarea'
				|| event.target.localName == 'button'
			) {
				this.autoplay = false;
			} else {
				this.autoplay = !this.autoplay;
			}

		}, { signal:this.#clickAutoAbortcontroller.signal } );
	}

	/**
	 * Creates the controls for the carousel if user did not include them.
	 * @returns {NodeList} The created controls
	 *
	 * @test self.slides = [document.createElement('img')];
	 		self.createControls instanceof NodeList // true
	 */
	createControls() {
		const frag = new DocumentFragment();
		const input = document.createElement('input');
		input.type = 'radio';
		input.name = 'c' + Math.random();
		input.setAttribute('slot', 'controls');

		this.slides.forEach ( ( slide, idx ) => {
			const control = input.cloneNode(true);
			if ( idx === 0 ) control.checked = true;
			if ( !this.controls ) control.setAttribute( 'hidden', 'true' );
			frag.append( control );
		});

		const controls = frag.querySelectorAll('input');
		controls[0].checked = true;
		this.append(frag);
		return controls;
	}

	/**
	 * Initializes the carousel controls
	 * @param {NodeList} controls - The node list of carousel controls
	 * @returns {NodeList}				- The controls
	 *
	 * @test self.controls // 'foo';
	 */
	initControls( controls ) {
		let i = 0;
		controls[0].setAttribute( this.activeindicator, 'true' );

		for ( i; i < controls.length; i++ ) {
			controls[i].setAttribute( 'data-target', i );
			controls[i].addEventListener( 'click', event => {
				this.transition( event );
				for ( const control of controls ) {
					control.removeAttribute( this.activeindicator );
					event.target.setAttribute( this.activeindicator, 'true' );
				}
			}, { signal:this.#abortcontroller.signal } );
		}

		return controls;
	}

	/**
	 * Transitions the carousel to the next slide.
	 *
	 * @param {Event} event - The click event that triggered the transition.
	 */
	transition( event ) {
		const panel = this.shadowRoot.querySelector( '#panel' );
		const target = event.target.getAttribute( 'data-target' );
		const currentSlide = this.querySelector( `[slot='${this.#currentSlot}']` );
		const targetSlide = this.querySelector( `[data-slide='${target}']` );
		const nextSlot = ( this.#currentSlot === 'carda' ) ? 'cardb' : 'carda';
		if ( currentSlide === targetSlide ) return;

		targetSlide.setAttribute( 'slot', nextSlot);
		this.#currentSlot = nextSlot;

		switch (this.effect) {
		case 'slip':
			// effect breaks if 'which' is moved to top of function
			const whichSlip = (this.#currentSlot === 'carda') ? 'a' : 'b';
			panel.classList.add(whichSlip);
			panel.classList.add( 'slip-left' );
			this.endEffect( targetSlide, ['slip-left', whichSlip]);
			break;
		case 'fade':
			panel.classList.add( 'fade-out' );
			this.endEffect( targetSlide, ['fade-out']);
			break;
		case 'flip':
			// effect breaks if 'which' is moved to top of function
			const whichFlip = (this.#currentSlot === 'carda') ? 'b' : 'a';
			panel.classList.add('flipped');
			panel.classList.add(whichFlip);
			setTimeout( () => { panel.classList.add('flip') }, 5 );
			this.endEffect( targetSlide, ['flipped', whichFlip, 'flip']);
			break;
		default:
			panel.classList.add('slide-left');
			this.endEffect( targetSlide, ['slide-left']);
			break;
		}
	}

	endEffect( target, cssClass = [] ) {
		const panel = this.shadowRoot.querySelector( '#panel' );
		let abortcontroller = new AbortController();

		panel.addEventListener( 'transitionend', event => {
			abortcontroller.abort();
			abortcontroller = null;

			const nextSlot = ( this.#currentSlot === 'carda') ? 'cardb' : 'carda';
			const nextSlide = this.querySelector(`[slot=${nextSlot}]`);
			const nextCard = panel.querySelector(`#${nextSlot}`);
			nextSlide.removeAttribute( 'slot' );
			for (const cls of cssClass ) {
				panel.classList.remove( cls );
			}
			panel.append (nextCard);
			this.enableControls();

			if (this.autoplay) {
				const pause = this.pause * 1000;
				setTimeout( () => {
					this.play();
				}, pause);
			}
		}, { signal:abortcontroller.signal } );

		this.disableControls();
	}

	disableControls( controls = this.#carouselControls ) {
		for ( const control of controls ) {
			control.disabled = true;
		}
	}

	enableControls( controls = this.#carouselControls ) {
		for ( const control of controls ) {
			control.disabled = false;
		}
	}

	play( iteration = this.#slideNum ) {
		if (!this.autoplay) return;
		const count = this.slides.length * this.repeat;
		const idx = iteration % this.#carouselControls.length;
		console.log(iteration, idx);
		this.#carouselControls[idx].click();
		this.#slideNum++;
		if (count !== 0 && iteration >= count) {
			this.autoplay = false;
			this.#slideNum = 1;
		}
	}

	fireEvent(property, value) {
		const details = { property:property, value:value };
		const evt = new CustomEvent(this.localName, { detail: details });
		document.dispatchEvent(evt);
	}

	get autoplay () { return this.#autoplay; }
	set autoplay ( value ) {
		switch (value) {
		case 'false':
		case false:
			this.#autoplay = false;
			break;
		default:
			this.#autoplay = true;
			this.play();
			break;
		}

		this.fireEvent('autoplay', value);
	}

	get clickplay() { return this.#clickplay; }
	set clickplay( value ) {
		switch ( value ) {
		case 'false':
		case false:
			value = false;
			this.removeAttribute('clickable');
			this.#clickAutoAbortcontroller.abort();
			break;
		default:
			value = true;
			this.#clickAutoAbortcontroller = new AbortController();
			if (this.slides) {
				this.setAttribute('clickable', 'true');
				for ( const slide of this.slides ) {
					this.addClickAutoListener(slide);
				}
			}

			break;
		}

		this.#clickplay = value;
		this.fireEvent( 'clickplay', value );
	}

	get controls () { return this.#controls; }
	set controls ( value ) {
		const elem = this.shadowRoot.querySelector( '#controls' );
		switch ( value ) {
		case 'false':
		case false:
			value = false;
			elem.setAttribute( 'hidden', 'true' );
			break;
		default:
			value = true;
			elem.removeAttribute( 'hidden' );
		}

		this.#controls = value;
		this.fireEvent( 'controls', value );
	}

	get effect () { return this.#effect; }
	set effect ( value ) {
		this.#effect = value;
		this.fireEvent( 'effect', value );
	}

	get pause () { return this.#pause; }
	set pause ( value ) {
		value = parseFloat( value );
		if ( isNaN( value ) || value < 0 ) value = 0;
		this.#pause = value;
		this.fireEvent( 'pause', value );
	}

	get repeat () { return this.#repeat; }
	set repeat ( value ) {
		this.#repeat = value;
		this.fireEvent( 'repeat', value );
	}

	get speed() { return this.#speed; }
	set speed( value ) {
		value = parseFloat( value );
		this.#speed = value;
		this.style.setProperty('--speed', `${value}s`);
		this.fireEvent('speed', value);
	}

}

document.addEventListener('DOMContentLoaded', customElements.define('wijit-carousel', WijitCarousel));
