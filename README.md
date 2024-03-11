# Carousel Web Component

Creates a carousel with a variety of effects.
( More documentation is in process )

Demo: https://holmesbryant.github.io/wijit-carousel/

## Changelog

- v2.0
    - Complete rewrite
    - Changed the observed attribute "autocontrols" to "controls".
    - Changed the observed attribute "auto" to "autoplay".
    - Removed "activeclass" from list of observed attributes.
    - Added 'slip' to list of effects
    - Exposed CSS variables "--panel-height", "--perspective", "--perspective-origin".


### Attributes

*   **effect** (default: fade) The transition effect. Options are 'fade', 'slide', 'flip'. There is also a 'random' effect, but it is just used for testing. It isn't really meant for production.

*   **speed** (default: 1) How fast the transition happens, in seconds. Values below .2 (point two) create unexpected behavior.

*   **controls** If present, will include automatically generated controls at the bottom of the slide panel. These are basic radio inputs. If you use autocontrols, do not add your own controls.

*   **Autoplay Options**
    *   **autoplay** (default: false) Whether to automatically advance the slides
    *   **repeat** (default: 0) How many times to loop through the whole set of slides. 0 means infinite iterations.
    *   **pause** (default: 3) Number of seconds to pause between transitions. Values approaching "0" may produce unexpected behavior.

### Usage

          <head>
            <script type="module" src="wijit-carousel.js"></script>
          </head>

          <body>
            <wijit-carousel>

              <img src="/path/to/img">

              <figure>
                <img src="path/to/img">
                <figcaption>A caption</figcaption>
              </figure>

              <div>Baz</div>

              <!-- optional -->
              <button slot="controls">Foo</button>
              <button slot="controls">Bar</button>
              <button slot="controls">Baz</button>

            </wijit-carousel>
          </body>

### Controls

You may add your own controls. They can be buttons, radio inputs, links or any other valid HTML element. Be sure to include the same number of controls as slides and assign each control to the slot "controls". Click handlers are automatically applied to them. You may use the custom attribute [controls] to automatically include basic radio inputs (which you can style using your own css). If you do this, do not include your own controls. Note that when a user clicks on a control, auto-play is automatically disabled.

### Styling

Slides and controls can be styled normally using css. In special cases, you may need to add styling to elements in the shadow root. In that case you can use the css selectors:

*   wijit-carousel::part(container)
*   wijit-carousel::part(panel)
*   wijit-carousel::part(card)
*   wijit-carousel::part(controls)


The shadow root looks like this:

        `<div id="container" part="container">
          <div id="panel" part="panel">
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
        <div hidden id="slides">
          <slot></slot>
        </div>`


Do not manually assign slides to the 'carda' or 'cardb' slots. That is done automatically.
