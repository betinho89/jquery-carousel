(function ($, window, document) {
  var oCarousel = {
    initialize: function(options, parent) {
      var base = this;

      base.options = options;
      base.$parent = $(parent);
      base.$items = base.$parent.find(base.options.classelement);
      // base.$content = base.$parent.find(base.options.classcontent);
      base.iItems = base.$items.length;
      base.iCurrent = 0;
      base.oTimer = null;

      base.buildContent();
      base.getSizes();
      base.setSizes();
      base.rotate();
      base.setEvents();
    },
    buildContent: function() {
      var base = this;

      base.$content = $('<div class="carousel-content" />').appendTo(base.$parent);
      var $control = $('<div class="carousel-control" />').appendTo(base.$parent);
      base.$items.each(function(index, el) {
        base.$content.append($(el));
      });
      base.$leftcontrol= $('<span class="left-control"></span>').appendTo($control);
      base.$rightcontrol= $('<span class="right-control"></span>').appendTo($control);
    },
    setEvents: function() {
      var base = this;

      $(window).resize(function() {
        clearTimeout(base.oTimer);
        base.oTimer = setTimeout(function() {
          base.onEndResize(base);
        }, 600);
      });
      base.$leftcontrol.on('click', function() {
        base.iCurrent--;
        base.animate();
      });
      base.$rightcontrol.on('click', function() {
        base.iCurrent++;
        base.animate();
      });
    },
    onEndResize: function() {
      var base = this;

      base.getSizes();
      base.setSizes();
      base.updateContent();
    },
    getSizes: function() {
      var base = this;

      base.iWidth = base.$parent.width();
      base.iHeight = base.$parent.height();
      base.iContent = base.iItems * base.iWidth;
    },
    setSizes: function() {
      var base = this,
      iTop = 0;

      base.$content.width(base.iContent);
      base.$content.height(base.iHeight);
      base.$items.each(function(index, el) {
        var $el = $(el);

        $el.width(base.iWidth);
        $el.height(base.iHeight);
      });
      iTop = (base.iHeight / 2) - (base.$leftcontrol.height()/2);
      base.$leftcontrol.css('top', iTop + 'px');
      base.$rightcontrol.css('top', iTop + 'px');
    },
    updateContent: function() {
      var base = this,
          iMargin = 0;

      iMargin = (base.iWidth * base.iCurrent) * -1;
      base.$content.css('margin-left', iMargin + 'px');
    },
    rotate: function() {
      var base = this,
          iMargin = 0;

      setInterval(function() {
        base.iCurrent++;


        base.animate();
      }, base.options.itime * 1000);
    },
    animate: function(){
      var base = this,
          iMargin = 0;

      if(base.iCurrent >= base.iItems || base.iCurrent < 0) {
        base.iCurrent = 0;
      }

      iMargin = (base.iWidth * base.iCurrent) * -1;
      base.$content.animate({
        marginLeft: iMargin + 'px'
      }, base.options.ispeed * 1000, function() {
      });
    }
  };

  $.fn.carousel = function(options) {
    return this.each(function () {
      var temp = Object.create(oCarousel);
      temp.initialize(options, this);
    });
  };
})(jQuery, window, document);
