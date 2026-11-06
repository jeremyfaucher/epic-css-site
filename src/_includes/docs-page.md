<div class="grid lg-grid-sidebar-left-25">
<div>
<h2 class="fs-20 mb-12 items-center">Utilities</h2>
<ul class="ml-12 list-none">
<li class="mb-12"><a href="/docs#flexbox" class="active" aria-current="page">Flexbox</a></li>
<li><a href="/docs#grid" class="" aria-current="page">Grid</a></li>
<li><a href="/docs#colors" class="" aria-current="page">Colors</a></li>
</ul>
</div>
<div >
<article>
<h1 class="fs-32 lh-32 mb-12" id="introduction">Introduction</h1>
<p class="mb-0">Get started with Epic, an intuitive UI library that is easy to use and manage.</p>
<h2 class="fs-24 lh-24 mb-12" id="flexbox">Flexbox</h2>
<p>Quickly manage the layout, alignment, and sizing of grid columns, navigation, components, and more with a full suite of responsive flexbox utilities.</p>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout">Flexbox</a> is a one-dimensional layout method for arranging items in rows or columns. Items <em>flex</em> (expand) to fill additional space or shrink to fit into smaller spaces. This article explains all the fundamentals.</p>
<ul>
<li><code>.flex</code></li>
<li><code>.inline-flex</code></li>
<li><code>.sm-flex</code></li>
<li><code>.sm-inline-flex</code></li>
<li><code>.md-flex</code></li>
<li><code>.md-inline-flex</code></li>
<li><code>.lg-flex</code></li>
<li><code>.lg-inline-flex</code></li>
<li><code>.xl-flex</code></li>
<li><code>.xl-inline-flex</code></li>
<li><code>.xxl-flex</code></li>
<li><code>.xxl-inline-flex</code></li>
</ul>

<h2 class="fs-24 lh-24 mb-12" id="grid">Grid</h2>
<p>Simply mobile first grid with our using CSS native auto flow.</p>

<style>
    .grid {
    display: grid;
    gap: 1rem;
}

/* Default Mobile Stacking */
.grid-sidebar-left {
    grid-template-columns: 1fr; /* Stacks sidebar on mobile */
}

/* Left Sidebar (Percentage Widths) */
.lg-grid-sidebar-left-25 {
    grid-template-columns: 25% 1fr;
}

.lg-grid-sidebar-left-30 {
    grid-template-columns: 30% 1fr;
}

.lg-grid-sidebar-left-40 {
    grid-template-columns: 40% 1fr;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
    .lg-grid-sidebar-left-25,
    .lg-grid-sidebar-left-30,
    .lg-grid-sidebar-left-40 {
        grid-template-columns: 1fr; /* Stacks sidebar on smaller screens */
    }
}

</style>

<!-- Left Sidebar (25% Width) -->
<div class="grid lg-grid-sidebar-left-25">
    <aside class="sidebar">Sidebar (25%)</aside>
    <main class="content">Main Content</main>
</div>

<!-- Left Sidebar (30% Width) -->
<div class="grid lg-grid-sidebar-left-30">
    <aside class="sidebar">Sidebar (30%)</aside>
    <main class="content">Main Content</main>
</div>

<!-- Left Sidebar (40% Width) -->
<div class="grid lg-grid-sidebar-left-40">
    <aside class="sidebar">Sidebar (40%)</aside>
    <main class="content">Main Content</main>
</div>


<h2 class="fs-24 lh-24 mb-12" id="colors">Colors and palettes</h2>
<p>Use semantic colors so a palette change updates the same components throughout your site. Text and background utilities are separate: pair them deliberately and check that the text remains readable.</p>
<div class="clr-primary-bg p-24 mb-16">
  <p class="clr-primary">Primary text on the primary background.</p>
  <p>This paragraph inherits the body text color.</p>
</div>
<div class="clr-secondary-bg p-24 mb-16">
  <p class="clr-secondary">Secondary text on the secondary background.</p>
  <p class="clr-white">White text stays white when the palette changes.</p>
</div>
<pre><code>&lt;div class="clr-primary-bg p-24"&gt;
  &lt;p class="clr-primary"&gt;Primary text&lt;/p&gt;
&lt;/div&gt;
&lt;div class="clr-secondary-bg p-24"&gt;
  &lt;p class="clr-secondary"&gt;Secondary text&lt;/p&gt;
&lt;/div&gt;</code></pre>
<table>
<thead><tr><th>Utility</th><th>Sass palette value</th><th>Changes</th></tr></thead>
<tbody>
<tr><td><code>clr-body-bg</code></td><td><code>$clr-body-bg</code></td><td>Background color</td></tr>
<tr><td><code>clr-primary</code></td><td><code>$clr-primary</code></td><td>Text color</td></tr>
<tr><td><code>clr-primary-bg</code></td><td><code>$clr-primary-bg</code></td><td>Background</td></tr>
<tr><td><code>clr-secondary</code></td><td><code>$clr-secondary</code></td><td>Text color</td></tr>
<tr><td><code>clr-secondary-bg</code></td><td><code>$clr-secondary-bg</code></td><td>Background</td></tr>
<tr><td><code>clr-white</code></td><td><code>$clr-white</code></td><td>Text color</td></tr>
</tbody>
</table>
<h3 class="fs-20 mb-12">Switch a palette</h3>
<p>Overrides depend on the library declaring fallback colors with <code>!default</code>. This site's local Sass supports that. The published npm <code>0.14.0</code> library overwrites earlier assignments; the prepared <code>0.14.1</code> patch fixes this and is awaiting publication. A fresh starter install needs that fixed release before these overrides will work.</p>
<p>In the Eleventy theme or this site's <code>src/my-epic-css/_custom.scss</code>, comment out the eight assignments in the active palette, then uncomment the eight assignments in another palette. Keep one complete palette active. Sass compiles the chosen values into CSS; this does not create a runtime light/dark switch.</p>
<pre><code>// Example light palette
$clr-body: #1e1e1e;
$clr-body-bg: #f4f6fa;
$clr-primary: #0067b8;
$clr-primary-light: #4f9eea;
$clr-primary-bg: #dceeff;
$clr-secondary: #7a7574;
$clr-secondary-bg: #ececec;
$clr-white: #ffffff;</code></pre>
<p><code>$clr-body</code> sets the base text color. <code>$clr-primary-light</code> sets the accent on <code>main a.clr-underline:hover</code>. There are no standalone <code>clr-body</code> or <code>clr-primary-light</code> utilities. Changing a palette updates existing declarations, rather than generating new color class names.</p>
<p>Run <code>npm start</code> to preview palette changes. Check text, links, hover states, code blocks, and both callouts above. White text can disappear on a light surface: keep it on a sufficiently dark background or use an appropriate semantic text color. The example palettes are starting points; their names do not guarantee contrast for every combination.</p>
<p>Stop the development server, then run <code>npm run build</code> to compile Sass, filter CSS using literal source classes, and generate the production site. Run <code>npm run validate</code> for the same check with temporary output and restored CSS files. Always preview important pages after filtering, especially if class names are assembled dynamically.</p>
</article>
</div>
