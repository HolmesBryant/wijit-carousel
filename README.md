# Carousel Web Component

Creates a carousel with a variety of effects.

Demo: https://holmesbryant.github.io/wijit-carousel/

### Attributes

*   **effect** (default: fade) The transition effect. Options are 'fade', 'slide', 'flip'. There is also a 'random' effect, but it is just used for testing. It isn't really meant for production.

*   **speed** (default: 1) How fast the transition happens, in seconds. Values below .2 (point two) create unexpected behavior.

*   **activeindicator** (default: 'active')The name of the css class to apply to the control associated with the active slide. Do not include a dot (.)

*   **autocontrols** If present, will include automatically generated controls at the bottom of the slide panel. These are basic radio inputs. If you use autocontrols, do not add your own controls.

*   **Autoplay Options**
    *   **auto** (default: false) Whether to automatically advance the slides
    *   **repeat** (default: 0) How many times to loop through the whole set of slides. 0 means infinite iterations.
    *   **pause** (default: 3) Number of seconds to pause between transitions. Values below 1.2 break the transition effect.

### Usage

          <head>
            <script defer type="module" src="wijit-carousel.js"></script>
          </head>
          <body>
            <wijit-carousel>
              <div>Foo</div>
              <div>Bar</div>
              <div>Baz</div>
              <button slot="controls">Foo</button>
              <button slot="controls">Bar</button>
              <button slot="controls">Baz</button>
            </wijit-carousel>
          </body>

### Controls

You may add your own controls. They can be buttons, radio inputs, links or any other valid HTML element. Be sure to include the same number of controls as slides and assign each control to the slot "controls". Click handlers are automatically applied to them. You may use the custom attribute [autocontrols] to automatically include basic radio inputs. If you do this, do not include your own controls. Note that when a user clicks on a control, auto-play is automatically disabled.

### Styling

Slides and controls can be styled normally using css. In special cases, you may need to add styling to elements in the shadow root. In that case you can use the css selectors:

*   wijit-carousel::part(container)
*   wijit-carousel::part(panel)
*   wijit-carousel::part(card)
*   wijit-carousel::part(controls)


The shadow root looks like this:

        `<div id="container" part="container">
          <div id="panel" part="panel" class="smooth">
            <div id="carda" part="card">
              <slot name="carda"></slot>
            </div>
            <div id="cardb" part="card">
              <slot name="cardb"></slot>
            </div>
          </div>
          <div id="controls" part="controls">
            <slot name="controls"></slot>
          </div>
        </div>
        <div id="slides" class="hidden" aria-hidden="true">
          <slot></slot>
        </div>`


You don't need to manually assign slides to the 'carda' or 'cardb' slots. That is done automatically.
