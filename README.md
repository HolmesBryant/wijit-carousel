# Carousel Web Component

Creates a carousel with a variety of effects.

Demo: https://holmesbryant.github.io/wijit-carousel/

### Attributes

*   **effect** (default: fade) The transition effect. Options are 'fade', 'slide', 'flip'.

*   **speed** (default: 1) How fast the transition happens, in seconds. Values below .2 (point two) create unexpected behavior.

*   **activeindicator** (default: 'active')The name of the css class to apply to the control associated with the active slide. Do not include a dot (.)

*   **autocontrols** If present, will include automatically generated controls at the bottom of the slide panel. These are basic radio inputs.

*   **Autoplay Options**
    *   **auto** (default: false) Whether to automatically advance the slides
    *   **repeat** (default: 0) How many times to loop through the whole set of slides. 0 means infinite iterations.
    *   **pause** (default: 3) Number of seconds to pause between transitions.

### Usage

            `<script type="module" src="wijit-carousel.js"></script>
            <wijit-carousel>
              <div>Foo</div>
              <div>Bar</div>
              <div>Baz</div>
              <button slot="controls">Foo</button>
              <button slot="controls">Bar</button>
              <button slot="controls">Baz</button>
            </wijit-carousel>`

