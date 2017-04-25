# jquery-carousel
========================================

#### Demo

[http://betinho89.com/examples/carousel-with-jquery/](http://betinho89.com/examples/carousel-with-jquery/)

#### 1. Started
```html
  <!-- Basic stylesheet -->
  <link rel="stylesheet" href="css/style.css" />

  <!-- Include JS Plugin -->
  <script type="text/javascript" src="js/script.js"></script>
```

#### 2. Set up your HTML
```html
<div id="myCarousel" class="carousel-source">
  <img src="http://loremflickr.com/320/240?random=1" alt="" class="carousel-element" />
  <img src="http://loremflickr.com/320/240?random=2" alt="" class="carousel-element" />
  <img src="http://loremflickr.com/320/240?random=1" alt="" class="carousel-element" />
</div>
```

#### 3. Call the plugin
```html
<script type="text/javascript">
  jQuery(document).ready(function($) {
    $("#myCarousel").carousel({
      bEnabledAnimation: true,
      bShowControlList: true,
      bShowControls: true,
      bShowPlayControl: true,
      iDuration: 5,
      iNumberImages: 1,
      sAnimation: "margin",
      sPosition: "horizontal",
    });
  });
</script>
```


#### Third-Party Plugins
* [jQuery2.1.3](https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js)
* [Font Awesome](http://fontawesome.io/icons/) - Optional (The icons can be transformed into image)
