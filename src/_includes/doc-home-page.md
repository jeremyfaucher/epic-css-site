<div class="wrapper">
<article class="container">
<h2 class="fs-32 lh-32">Utility-first example usage</h2>

```html
<div class="container flex flex-col md-flex-row gap-40 items-center mb-80">
```

- Wrapper for side gutters of 5%: `wrapper`
- Container for max width: `container`
- To push the logo to left and the navigation to right use `flex`, `justify-between` and `items-center`.
- Medium screen and up flexbox row: `md-flex-row`
- Flex column for mobile first screens below medium: `flex-col`
- Padding top 24px: `pt-24` or padding top and bottom 24px `py-24`
- Margin bottom 80px: `mb-80`
- Gap of 24px: `flex` and `gap-24`

More usage documentation on this to come.

<h2>Usage from CDN</h2>

<p>Alternatively, you can use <a rel="noopener noreferrer" href="https://cdn.epiccss.com/0.12.0.css" target="_blank">cdn.epiccss.com</a> to link the latest version <code>0.12.0</code>.</p>

```html
<link
  rel="stylesheet"
  href="https://cdn.epiccss.com/0.12.0.css"
/>
```

<h2>Colors</h2>
<style>
.flex-container {
display: flex;
flex-wrap: wrap;
width: 100%;
}
.colors-item {
flex: 0 0 50%;
height: 150px;
box-sizing: border-box;
padding: 10px;
border: 1px solid #ccc;
text-align: center;
display: flex;
justify-content: center;
align-items: center;
}
</style>
<div class="flex-container mb-24">
    <div class="colors-item clr-primary clr-primary-bg">clr-primary<br>clr-primary-bg</div>
    <div class="colors-item clr-secondary clr-secondary-bg">clr-secondary<br>clr-secondary-bg</div>
</div>

```html
<div class="clr-primary clr-primary-bg">clr-primary<br>clr-primary-bg</div>
<div class="clr-secondary clr-secondary-bg">clr-secondary<br>clr-secondary-bg</div>
```

<h2>Vertical Card</h2>

<div class="clr-primary-bg p-24 border-r-16" style="max-width: 344px">
    <a href="/blog/web-design/second-web-design-post/" class="flex mb-8"><img src="/assets/blog/featured-image/design2seo-11ty-theme.webp" alt="I'm baby fashion axe swag actually, retro man" width="484" height="242"></a>
    <h3 class="clr-primary mt-0 mb-2">
        <a href="/blog/web-design/second-web-design-post/">Second Web Design Post</a>
    </h3>
    <div class="mb-24">
    by <span>admin</span> on <span>Mar 11, 2020</span>
    </div>
    <p class="mb-0">
    YOLO pop-up synth fixie slow-carb fingerstache before they sold out twee readymade church-key DIY meh umami crucifix offal. PBR&amp;B craft beer photo booth lyft gastropub 90's.
    This is a<a href="/blog/web-design/second-web-design-post/" class="clr-underline"> Read more...</a></p>
</div>

```html
<div class="clr-primary-bg p-24 border-r-16" style="max-width: 344px">
    <a href="/blog/web-design/second-web-design-post/" class="flex mb-8"><img src="/assets/blog/featured-image/design2seo-11ty-theme.webp" alt="I'm baby fashion axe swag actually, retro man" width="484" height="242"></a>
    <h3 class="clr-primary mt-0 mb-2">
        <a href="/blog/web-design/second-web-design-post/">Second Web Design Post</a>
    </h3>
    <div class="mb-24">
    by <span>admin</span> on <span>Mar 11, 2020</span>
    </div>
    <p class="mb-0">
    YOLO pop-up synth fixie slow-carb fingerstache before they sold out twee readymade church-key DIY meh umami crucifix offal. PBR&amp;B craft beer photo booth lyft gastropub 90's.
    This is a<a href="/blog/web-design/second-web-design-post/" class="clr-underline"> Read more...</a></p>
</div>
```

<h2>Horizontal Scroll Slider</h2>
</div>
</div>

<div class="slider-container position-relative w-100 flex items-center overflow-x-auto scroll-snap-x-mandatory scroll-smooth" style="scroll-padding-inline-start: calc((100vw - 1000px) / 2); scrollbar-width: none;">
  <div class="slider flex gap-16 w-100 gap-12 p-20 margin-auto" style="max-width: 1000px;">
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">1</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">2</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">3</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">4</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">5</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">6</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">7</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">8</div>
  </div>
</div>
<div class="flex gap-12 margin-auto" style="max-width: 1000px;">
<button class="prev-btn cursor-pointer p-20 z-10 border-none clr-white" aria-label="Previous" style="background: rgba(0, 0, 0, 0.5);">&#9665;</button>
<button class="next-btn cursor-pointer p-20 z-10 border-none clr-white" aria-label="Next" style="background: rgba(0, 0, 0, 0.5);">&#9655;</button>
</div>


<script>
document.addEventListener("DOMContentLoaded", function () {
  const outerContainer = document.querySelector(".position-relative.overflow-x-auto"); // Target the outer scrolling container
  const cardWidth = document.querySelector(".card").offsetWidth + 16; // Include margin
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      outerContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      outerContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
  }
});
</script>

<div class="wrapper">
<div class="container">

```html
<div class="slider-container position-relative w-100 flex items-center overflow-x-auto scroll-snap-x-mandatory scroll-smooth" style="scroll-padding-inline-start: calc((100vw - 1000px) / 2); scrollbar-width: none;">
  <div class="slider flex gap-16 w-100 gap-12 p-20 margin-auto" style="max-width: 1000px;">
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">1</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">2</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">3</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">4</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">5</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">6</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">7</div>
    <div class="card flex flex-basis-300 items-center clr-white border-r-16 snap-start justify-center" style="height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);">8</div>
  </div>
</div>
<div class="flex gap-12 margin-auto" style="max-width: 1000px;">
<button class="prev-btn cursor-pointer p-20 z-10 border-none clr-white" aria-label="Previous" style="background: rgba(0, 0, 0, 0.5);">&#9665;</button>
<button class="next-btn cursor-pointer p-20 z-10 border-none clr-white" aria-label="Next" style="background: rgba(0, 0, 0, 0.5);">&#9655;</button>
</div>
```

```js
<script>
document.addEventListener("DOMContentLoaded", function () {
  const outerContainer = document.querySelector(".position-relative.overflow-x-auto"); // Target the outer scrolling container
  const cardWidth = document.querySelector(".card").offsetWidth + 16; // Include margin
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      outerContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      outerContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
  }
});
</script>
```

</article>
</div>