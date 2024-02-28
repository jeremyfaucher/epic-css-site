---
title: First Graphic Design Post
date: 2019-03-11
featuredImage: /assets/blog/featured-image/design2seo-11ty-theme.webp
image: /assets/blog/design2seo-11ty-theme.jpg
imageAlt: I'm baby fashion axe swag actually, retro man
description: I'm baby fashion axe swag actually, retro man bun migas photo booth palo santo. Unicorn chillwave pork belly put a bird on it selvage gastropub celiac migas gochujang pour-over locavore keytar man braid sustainable shabby chic.
postImage: true
---

<p class="text-center mb-12">Compare style sheet file sizes.</p>

  <div class="flex justify-center mb-80">
    <div class="w-100 md-w-50">
      <div class="bg-black p-24 mb-12">
        <div class="flex justify-between">
          <span>Name</span>
          <span>size</span>
        </div>
        <hr class="mb-24">
        <div class="flex justify-between mb-12">
          <span>Epic CSS</span>
          <span>9 kb</span>
        </div>
        <div class="flex justify-between mb-12">
          <span>Tailwindcss</span>
          <span>59 kb</span>
        </div>
        <div class="flex justify-between mb-12">
          <span>Bootstrap</span>
          <span>109 kb</span>
        </div>
      </div>
       <p>See site performance by Speedlify.</p>
    </div>
  </div>

 

  <div class="container flex flex-col md-flex-row gap-40 items-center mb-80">
    <div class="flex justify-end md-w-50">
      <img src="assets/home-banner.webp" width="420" height="327" alt="girl working at computer thinking creatively">
    </div>
    <div class="md-w-50">
      {%- for post in collections.blog | reverse | limit_latest(1) -%}
        {% include 'post-latest.njk' %}
      {%- endfor -%}
    </div>
  </div>
</section>
<section class="mb-80">
  <div class="md:w-75">
    <h2 class="mb-12">Typewriter wolf ugh shoreditch brunch tote bag.</h2>
    <p>I'm baby hot chicken bitters irony thundercats etsy direct trade chillwave kickstarter truffaut unicorn crucifix shaman farm-to-table mixtape. Man braid wolf adaptogen chambray, irony chartreuse 90's shabby chic viral banjo live-edge. Twee try-hard mlkshk lomo raclette dreamcatcher narwhal craft beer.</p>
    <p>Kitsch crucifix truffaut chia flexitarian quinoa, tbh health goth man braid tote bag ramps raclette helvetica craft beer squid. Kitsch air plant gochujang, wolf occupy tumeric slow-carb typewriter umami art party taiyaki celiac mustache twee. Deep v literally mlkshk, woke try-hard vexillologist gochujang typewriter meggings farm-to-table.</p>
    <p>Trust fund retro seitan knausgaard, leggings kale chips echo park meh. Glossier viral before they sold out hashtag taiyaki. Lo-fi 3 wolf moon vice cloud bread mixtape art party everyday carry taxidermy cronut raw denim put a bird on it taiyaki cardigan photo booth blog.</p>
  </div>
</section>
<section class="mb-80">
  <h2 class="mb-2">Recent Blog Posts</h2>
  <p class="mb-24">YOLO pop-up synth fixie, slow-carb, fingerstache.</p>
  <div class="grid grid-col-2 gap-32">
    {%- for post in collections.blog | reverse | limit(5) -%}
      {% include 'post-summary.njk' %}
    {%- endfor -%}
  </div>
</section>