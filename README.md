# Carousel Web Component

Renders a carousel style widget.

Demo: https://holmesbryant.github.io/wijit-carousel/

### Attributes

-   **effect** optional (default: fade) The transition effect. Options are "fade", "slide" and "flip".
-   **auto** optional (default: false) Add this attribute to auto-play a slide show
-   **repeat** optional (default: 0) How many times to auto-repeat the slide show. Has no effect if "auto" attribute is not set. "0" means infinite repeat.
-   **delay** optional (default: 4) How many seconds to show each panel. Has no effect if "auto" attribute is not set.

### Usage

                <script type="module" src="wijit-carousel.js"></script>
                <wijit-carousel>
                  <div>Foo</div>
                  <div>Bar</div>
                  <div>Baz</div>
                  <button slot="controls">Foo</button>
                  <button slot="controls">Bar</button>
                  <button slot="controls">Baz</button>
                </wijit-carousel>
