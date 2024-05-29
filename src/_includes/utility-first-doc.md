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

## Usage from CDN

<p>Alternatively, you can use <a rel="noopener noreferrer" href="https://cdn.epiccss.com/pre-light.css" target="_blank">cdn.epiccss.com</a> to link <code>pre-light.css</code>.</p>

```html
<link
  rel="stylesheet"
  href="https://cdn.epiccss.com/pre-light.css"
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
background-color: #gray;
text-align: center;
display: flex;
justify-content: center;
align-items: center;
}
</style>
<div class="flex-container mb-24">
    <div class="colors-item clr-primary bg-primary">clr-primary<br>bg-primary</div>
    <div class="colors-item clr-secondary bg-secondary">clr-secondary<br>bg-secondary</div>
</div>

```html
<div class="clr-primary bg-primary">clr-primary<br>bg-primary</div>
<div class="clr-secondary bg-secondary">clr-secondary<br>bg-secondary</div>
```

<h2>Horizontal Card</h2>

<div class="clr-primary bg-primary p-24 border-r-16" style="max-width: 344px">
    <a href="/blog/web-design/second-web-design-post/" class="flex mb-8"><img src="/assets/blog/featured-image/design2seo-11ty-theme.webp" alt="I'm baby fashion axe swag actually, retro man" width="484" height="242"></a>
    <h3 class="clr-primary mt-0 mb-2">
        <a href="/blog/web-design/second-web-design-post/" class="clr-primary">Second Web Design Post</a>
    </h3>
    <div class="mb-24">
    by <span>admin</span> on <span>Mar 11, 2020</span>
    </div>
    <p class="mb-0">
    YOLO pop-up synth fixie slow-carb fingerstache before they sold out twee readymade church-key DIY meh umami crucifix offal. PBR&amp;B craft beer photo booth lyft gastropub 90's.
    This is a<a href="/blog/web-design/second-web-design-post/" class="clr-primary underline-clr"> Read more...</a></p>
</div>

```html
<div class="clr-primary bg-primary p-24 border-r-16" style="max-width: 344px">
    <a href="/blog/web-design/second-web-design-post/" class="flex mb-8"><img src="/assets/blog/featured-image/design2seo-11ty-theme.webp" alt="I'm baby fashion axe swag actually, retro man" width="484" height="242"></a>
    <h3 class="clr-primary mt-0 mb-2">
        <a href="/blog/web-design/second-web-design-post/" class="clr-primary">Second Web Design Post</a>
    </h3>
    <div class="mb-24">
    by <span>admin</span> on <span>Mar 11, 2020</span>
    </div>
    <p class="mb-0">
    YOLO pop-up synth fixie slow-carb fingerstache before they sold out twee readymade church-key DIY meh umami crucifix offal. PBR&amp;B craft beer photo booth lyft gastropub 90's.
    This is a<a href="/blog/web-design/second-web-design-post/" class="clr-primary underline-clr"> Read more...</a></p>
</div>
```