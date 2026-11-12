# Writing demo copy

Example content should quietly teach a useful design or development idea while letting readers inspect the layout. Use this workflow for new examples and intentional copy updates; it does not require rewriting every existing demo.

1. Choose one practical topic: spacing, rhythm, pattern, hierarchy, alignment, contrast, tension, harmony, responsive UI, utility CSS, performance, color relationships, foreground/background readability, or accessibility. Avoid presenting a fixed number of universal design principles.
2. Write a short descriptive heading and roughly two brief, plain-language sentences. Give one accurate takeaway the reader can apply. Avoid filler, fictional listings or bands, unrelated themes, product promotion, keyword stuffing, and SEO promises.
3. Match the content length to the layout's purpose. Vary heading and body lengths when testing wrapping, alignment, or responsive behavior; keep the lesson short enough that it does not distract from the example.
4. Use meaningful topic labels and link or button text. Send links to a relevant existing destination, and make surrounding notes describe that destination accurately. Describe informative images with accurate alt text; use empty alt text for purely decorative images when appropriate. Do not describe an image as the lesson's subject if it shows something else.
5. Check factual claims. Before introducing a specific accessibility standard, conformance level, or contrast threshold, verify it against current primary W3C guidance and link the applicable source. Do not imply that one color choice or contrast check establishes overall accessibility. Numerical standards are not needed for every lesson.
6. Edit the canonical shared data/template, then render every surface that uses it. Check that previews and copyable HTML agree, labels and destinations make sense, and the copy still fits each layout. Preserve utility classes, images, and interactions unless the task calls for changing them.

## Building demo layouts

Use existing Epic CSS utilities first, checking their actual declarations before duplicating behavior such as `display: grid`. If no suitable utility exists, a small inline or example-scoped rule is acceptable to get the demo working; include required styling in its copyable source. Review these gaps later and decide which patterns belong in the shared library. Add only the specifically agreed reusable utilities during a sprint, rather than turning every custom declaration into a new utility.

## Shared card example

Edit `src/_data/cardExample.js` for content and `src/_includes/components/cards/parts.njk` for shared content markup. Both card variants feed the homepage showcase and Cards page. Keep the showcase introduction and its relationship to the Cards page intact.

**Give content room to breathe**

Consistent spacing helps readers see what belongs together. Leave more space between groups than between related elements.

Topic labels: “Design fundamentals” and “Spacing and rhythm”. Link: “Explore spacing and layout”, pointing to `/docs/wrapper-and-container/`.
