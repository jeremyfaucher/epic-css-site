<div class="left-sidebar-sm">
<div>
<h2 class="fs-20 mb-12 items-center">Utilities</h2>
<ul class="ml-12">
<li><a href="/docs#flexbox" class="active" aria-current="page">Flexbox</a></li>
<li><a href="/docs#grid" class="" aria-current="page">Grid</a></li>
</ul>
</div>
<div >
<article>
<h1 class="fs-32 lh-32 mb-12" id="flexbox">Introduction</h1>
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


</article>
</div>