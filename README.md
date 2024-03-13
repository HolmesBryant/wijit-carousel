# Carousel Web Component

Creates a carousel with a variety of effects.

Demo: [https://holmesbryant.github.io/wijit-carousel/](https://holmesbryant.github.io/wijit-carousel/)

## Changelog

- v2.0
    - Complete rewrite
    - Changed the default effect from "fade" to "slide".
    - Changed the observed attribute "autocontrols" to "controls".
    - Changed the observed attribute "auto" to "autoplay".
    - Removed "activeclass" from list of observed attributes.
    - The active control (if controls are present) now has the attribute "active". In CSS, you can target it with element[active] { ... }.
    - Added "slip" to list of effects.
    - Exposed CSS variables "--overflow", "--transition-timing", "--panel-height", "--perspective", "--perspective-origin".

## Usage

          <head>
            <script type="module" src="wijit-carousel.js"></script>
          </head>

          <body>
            <wijit-carousel>
              <!-- Any valid HTML element or custom element -->
              <img src="/path/to/img">
              <figure>
                <img src="path/to/img">
                <figcaption>A caption</figcaption>
              </figure>
              <div>
                <h1>FOO!</h1>
                <p>Lorem ipsum ...</p>
              </div>
              <!-- controls are optional -->
              <button slot="controls">Img</button>
              <button slot="controls">Figure</button>
              <button slot="controls">FOO!</button>
            </wijit-carousel>
          </body>


## Attributes

* **effect** ( default: "slide" )
    - Acceptable values: ["slide", "slip", "fade", "flip"]
    - The transition effect.
* **controls** ( default:"false" )
    - Acceptable values: [" ", "false", truthy values]
    - Any value except "false" (including an empty string) is "true". If this attribute is present, the component will include automatically generated controls at the bottom of the slide panel. These are basic radio inputs. They are inserted into the light DOM, so you can style them however you want. If you include this attribute, do not add your own controls.
* **speed** ( default:1 )
    - Acceptable values: [any integer or float]
    - How fast the transition happens, in seconds. Lower values result in faster transitions.
* **Autoplay Options**
    - **autoplay** ( default:false )
        - Acceptable values: [" ", "false", truthy values]
        - Whether to automatically advance the slides. Any value except "false" is "true".
    - **repeat** ( default:0 )
        - Acceptable values: [any integer]
        - How many times to loop through the whole set of slides. 0 means infinite iterations.
    - **pause** ( default:3 )
        - Acceptable values: [any integer or float]
        - Number of seconds to pause between transitions. Values approaching "0" may produce unexpected behavior in some cases.
    - **clickauto** ( default:true )
    - Acceptable values [" ", "false", truthy values]
    - Any value except "false" is "true". This attribute determines if the carousel auto-plays/pauses when the user clicks on a slide. If autoplay is currently active, a click will pause the slide show. If it is currently inactive, a click will start (or restart) the slide show. A second click will reverse the effect of the first click. Any clicks inside of form elements (slides can include form elements) will only stop the slide show. The user must click somewhere in the slide - not in a form element - in order to restart the slide show.

## CSS Variables

These css variables affect the appearance and/or behavior of the component. You must apply these variables to the [wijit-carousel] element. For more information, please see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" target="_blank">Using CSS Custom Variables</a>

    //example
    <style>
      wijit-carousel {
        --overflow: visible;
        --transition-timing: ease;
        --panel-height: 300px;
        --perspective: 1800px;
        --perspective-origin: center;
      }
    </style>

* **--overflow** ( default:hidden )
    - Acceptable values: [hidden, visible, auto, scroll, clip]
    - Determines whether the content in the slides is allowed to overflow the container. For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/overflow" target="_blank">CSS overflow</a>
* **--transition-timing** ( default:ease )
    - Acceptable values: [Any value that works with the css transition-timing-function]
    - Determines how the timing between slide transitions is interpolated. For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function" target="_blank">CSS transition-timing-function</a>
* **--panel-height** ( default:300px )
    - Acceptable values: [Any valid css length value]
    - Determines the height of the panel which holds the slides, which in turn determines how much of the slide content is visible. For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/height" target="_blank">CSS height</a>
* **--perspective** ( default:1800px )
    - Acceptable values: [Any css length value]
    - **Only applies to the "flip" effect.** Determines the intensity of the flipping effect. For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/perspective" target="_blank">CSS perspective</a>
* **--perspective-origin** ( default:center )
    - Acceptable values: [center, top, bottom]
    - **Only applies to the "flip" effect.** Affects the apparent perspective from which the flipping effect is viewed. For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin" target="_blank">CSS perspective-origin</a>

## Available Slots

- **The default slot**
    - The default slot holds all the slides. You don't have to assign elements to the default slot. You only have to include an element as a child of [wijit-carousel] for it to become a slide in the carousel.
- **controls** [element slot="controls"]...[/element]
    - You may add your own controls. These can be buttons or any other valid HTML element. When a control is clicked, the corresponding slide is displayed. Be sure to include the same number of controls as slides, and assign each control to the slot "controls". Click handlers are automatically applied to them. If you include your own controls, do not use the attribute "controls".

## Styling the Shadow DOM

Since slides and controls remain in the light DOM, they can be styled using normal css techniques. However, in special cases, you may wish to add styling to elements in the shadow DOM. In that case you can use the css selectors:

*   wijit-carousel::part(container) : Contains the panel holding the slides and the controls.
*   wijit-carousel::part(panel) : The element that holds the cards.
*   wijit-carousel::part(card) : The element that wraps each slide.
*   wijit-carousel::part(controls) : The element that contains the carousel controls.


The shadow root looks like this:

    <div id="container" part="container">
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


### Important! Do not manually assign slides to the "carda" or "cardb" slots. That is done automatically.
