if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function (_, window, document) {
  var Carousel = {
    init: function(options, el) {
      var base = this;

      base._el = _(el);
      base.id = base._el.attr('id');
      base.parseOptions(options);
      base.varResize = null;

      base.cleanContent();
      base.setVars();
      if(base._items.length === 0) return false;
      base.cleanItems();

      if(typeof base.options.onBeforeCompute === "function")
        base.options.onBeforeCompute.apply(base);

      base.buildContent();
      base.customResize();
      base.setEvents();

      if(typeof base.options.onAfterCompute === "function")
        base.options.onAfterCompute.apply(base);
    },

    parseOptions: function(options) {
      var base = this,
          data = base._el.data();

      base.options = _.extend({}, _.fn.carousel.options, options);
      for(var datakey in data) {
        for(var optionkey in base.options) {
          if(datakey === optionkey.toLowerCase()) {
            base.options[optionkey] = data[datakey];
          }
        }
      }
    },

    setEvents: function() {
      var base = this;

      if(base.options.bShowControls) {
        base._el.find('.control').on('click', function(event) {
          base.onClickControl(event, _(this));
        });
      }

      if(base.options.bShowControlList || base.options.bShowPlayControl) {
        base._list.find('li').on('click', function(event) {
          base.onClickControlList(event, _(this));
        });
      }

      if(base.options.bAutoplay) {
        base.toggleEventHover(true);
      }

      if(base._target.length > 0) {
        base._el.find('.carousel-element').on('click', function(event) {
          event.preventDefault();
          var _el = _(this);

          base._container.find('.current').removeClass('current');
          _el.addClass('current');
          base.showTargetImage(_(_el.clone()));
        });
      }

      _(window).resize(function() {
        clearTimeout(base.varResize);
        base.varResize = setTimeout(function() {
          base.onEndResize();
        }, 150);
      });
    },

    toggleEventHover: function(active) {
      var base = this;

      if(active) {
        base._el.on({
          'mouseover': function(event) {
            event.preventDefault();
            base.bHover = true;
            base.pause(base);
          },
          'mouseout': function(event) {
            event.preventDefault();
            base.bHover = false;
            base.play(base);
          }
        });
      }
      else {
        base._el.off('mouseover');
        base._el.off('mouseout');
      }
    },

    play: function(base) {
      base.autoRotate();
    },

    pause: function(base) {
      window.clearTimeout(base.oTimer);
    },

    onClickControl: function(event, _el) {
      event.preventDefault();
      var base = this,
          sId = _el.attr('id'),
          isLeft = sId.indexOf('-lf') > -1 ? true : false;

      base.iCurrent = isLeft ? base.iCurrent - 1 : base.iCurrent + 1;
      base.animateRotate(base.iCurrent);
      base.manageControls(base.iCurrent);
      base.pause(base);
      if(!base.bHover) {
        base.play(base);
      }
    },

    onClickControlList: function(event, _el) {
      event.preventDefault();
      var base = this,
          isPlayControl = _el.hasClass('play-control');

      if(!isPlayControl) {
        base.iCurrent = parseInt(_el.attr('data-position'), 10);
        base.animateRotate(base.iCurrent);
        base.manageControls(base.iCurrent);
        base.pause(base);
        if(!base.bHover) {
          base.play(base);
        }
      }
      else {
        if(_el.hasClass('pause')) {
          base.options.bAutoplay = false;
          base.pause(base);
          base.toggleEventHover(false);
          _el.removeClass('pause');
          _el.addClass('play');
        }
        else if(_el.hasClass('play')) {
          base.options.bAutoplay = true;
          base.play(base);
          base.toggleEventHover(true);
          _el.removeClass('play');
          _el.addClass('pause');
        }
      }
    },

    manageControls: function(index) {
      var base = this;

      if(!base.bContinue) {
        if(base.options.bShowControls) {
          if(index === 0) {
            base._leftcontrol.css('display', 'none');
          }
          else {
            base._leftcontrol.css('display', 'block');
          }

          if(index === base.iNumberContents - 1) {
            base._rightcontrol.css('display', 'none');
          }
          else {
            base._rightcontrol.css('display', 'block');
          }
        }
      }
      else {
        if(base.options.bShowControls) {
          if(base.iCurrentMargin === 0) {
            base._leftcontrol.css('display', 'none');
          }
          else {
            base._leftcontrol.css('display', 'block');
          }

          if(base.iCurrentMargin === base.fMaxMargin) {
            base._rightcontrol.css('display', 'none');
          }
          else {
            base._rightcontrol.css('display', 'block');
          }
        }
      }

      base.activeCurrentList(index);
      base.refreshCounter(index);
    },

    activeCurrentList: function(index) {
      var base = this;

      if(base.options.bShowControlList) {
        base._list.find('li').removeClass('current');

        base._list.find('li[data-position="' + index + '"]').addClass('current');
      }
    },

    refreshCounter: function(index) {
      var base = this;

      if(base.options.bShowCounter) {
        base._counter.html(String(index + 1) + " " + base.options.sCounterLbl + " " + base.iNumberContents);
      }
    },

    autoRotate: function() {
      var base = this;
      if(base.options.bAutoplay) {
        base.oTimer = window.setTimeout(function(e) {
          var iNext = base.iCurrent;
          if(!base.bContinue) {
            if(iNext === base.iNumberContents - 1) iNext = 0;
            else iNext++;
          }
          else {
            if(base.iCurrentMargin === base.fMaxMargin) iNext = 0;
            else iNext++;
          }

          base.animateRotate(iNext);
          base.manageControls(iNext);
          base.iCurrent = iNext;
          window.clearTimeout(base.oTimer);
          base.autoRotate();
        }, base.iTimer * 1000);
      }
    },

    animateRotate: function(index) {
      var base = this,
          iMargin = parseInt(base.iMaxSize * (-index), 10);

      if(base.bContinue) {
        iMargin = parseInt(base.fSizePerContent * (-index), 10);
        if(iMargin < base.fMaxMargin) {
          iMargin = base.fMaxMargin;
        }
      }
      base.iCurrentMargin = iMargin;
      if(base.options.sPosition === 'horizontal') {
        base._container.animate({'margin-left': iMargin},{
          duration: base.options.iSpeedAnimation,
          easing: base.options.sTypeAnimation,
          start: function() {
            if(typeof base.options.beforeMove === "function")
              base.options.beforeMove.apply(base);
          },
          complete: function() {
            if(typeof base.options.afterMove === "function")
              base.options.afterMove.apply(base);
          },
        });
      }
      else {
        base._container.animate({'margin-top': iMargin},{
          duration: base.options.iSpeedAnimation,
          easing: base.options.sTypeAnimation,
          start: function() {
            if(typeof base.options.beforeMove === "function")
              base.options.beforeMove.apply(base);
          },
          complete: function() {
            if(typeof base.options.afterMove === "function")
              base.options.afterMove.apply(base);
          },
        });
      }
    },

    showTargetImage: function(_el) {
      var base = this;
      _el.attr('style', '');

      if(base._target.length > 0) {
        var _content = base._target.find('.target-content'),
            iTop = 0;
        _content.empty();

        _el.css('opacity', '0');
        _content.append(_el);
        if(base.options.bShowInfo) {
          var sTitle = _el.attr('data-title') || '',
              sDescription = _el.attr('data-description') || '';

          _content.append('<div class="target-data" />');
          if(!sTitle.trim()) _content.find('.target-data').append('<h2>' + sTitle + '</h2>');
          if(!sDescription.trim()) _content.find('.target-data').append('<p>' + sDescription + '</p>');
        }

        if(base.options.sPosition === 'vertical') {
          iTop = Math.ceil((base._el.height() - _el.outerHeight()) / 2);
          if(iTop > 0) {
            _el.css('margin-top', iTop + 'px');
          }
        }

        _el.animate({opacity: 1}, 800, function() {
          if(typeof base.options.onClickTarget === "function")
            base.options.onClickTarget.apply(base);
        });
      }
    },

    buildContent: function() {
      var base = this;

      base._container = _('<div class="carousel-images-inner" />').appendTo(base._el);
      base._el.addClass(base.options.sPosition);
      if(base._target.length > 0) {
        base._target.addClass(base.options.sPosition);
        base._target.append('<div class="target-content" style="opacity: 1;" />');
      }
      else {
        base._el.addClass('not-target');
      }

      if(base.options.sExtraClass.trim().length > 0) {
        base._container.addClass(base.options.sExtraClass);
      }

      if(base.options.bShowControls) {
        base._leftcontrol = _('<span class="control left-control '+ base.options.sPosition + '" id="' + base.id + '-lf"></span>').prependTo(base._el) ;
        base._rightcontrol = _('<span class="control right-control '+ base.options.sPosition + '" id="' + base.id + '-rf"></span>').appendTo(base._el);
      }

      if(base.options.bShowControlList) {
        base._list = _('<ul class="control-list"></ul>').appendTo(base._el);

        if(typeof base.options.customControlList === "function") {
          base.options.customControlList(base);
        }
        else {
          base._items.each(function(index, el) {
            base._list.append('<li class="element-control" data-position="' + String(index) + '"></li>');
          });
        }
      }

      if(base.options.bShowPlayControl) {
        if(!base._list) {
          base._list = _('<ul class="control-list"></ul>').appendTo(base._el);
        }
        base._list.append('<li class="play-control ' + ((base.options.bAutoplay) ? 'pause' : 'play') + '"><span></span></li>');
      }

      if(base.options.bShowCounter) {
        base._counter = _('<div class="carousel-counter"></div>').appendTo(base._el);
      }
    },

    buildInnerContent: function() {
      var base = this;
      if(base._items.length === 0) return false;

      var iMasterIndex = 0,
          _oFirstImage = _(base._items[0]).clone(),
          sClass = (base.bContinue) ? 'carousel-images-continue' : 'carousel-images-content',
          iMarginTop = 0,
          sHtml = "";

      _(base._items[0]).addClass('current');
      if(base._items.length > 1) {
        for (var i = 0; i < base.iNumberContents; i++) {
          var _content = _('<div class="' + sClass + '" id="' + (base.id + "-content-" + String(i)) + '" />').appendTo(base._container),
              iCountImages = 0;

          var _element;
          for (var j = iMasterIndex; j < base._items.length; j++) {
            if(iCountImages === base.options.iNumberImages) break;
            _element = _(base._items[j]);

            if(!base.bContinue) {
              if(base.options.iNumberImages === 1) _element.css('float', 'left');
              _element.css(base.sDimension, base.fSizeOfImage + '%');
              _element.css(base.sDimension === 'width' ? 'margin-left' : 'margin-top', base.fPaddingOfImage + '%');
              if(_element.hasClass('carousel-image-text')) {
                _element.find('img').css({
                  'float': 'left',
                  'width': '100%'
                });
              }
            }
            else {
              if(base.options.sHeightPerElement !== "") {
                _element.css(base.sDimension === 'width' ? 'height' : 'width', base.options.sHeightPerElement);
              }
              else {
                if(!_element.hasClass('video-element')) _element.css('width', 'auto');
                else  _element.css('width', '100%');
              }
            }
            if(_element.hasClass('video-element') && !_element.hasClass('not-fake')) {
              _element.prepend('<div class="fake-video-element" />');
            }
            if(_element.parent('a').length > 0) {
              _content.append(_element.parent('a'));
            }
            else if(_element.hasClass('carousel-text')) {
              sHtml = _element.html();
              _element.empty();
              _element.append(_('<p></p>').html(sHtml));
              _content.append(_element);
            }
            else {
              _content.append(_element);
            }
            if(base.sDimension === 'height' && !base.bContinue) _content.append('<br/>');

            iMasterIndex++;
            iCountImages++;
          }

          if(!base.bContinue) {
            _content.css(base.sDimension, base.iMaxSize + 'px');
          }
          else {
            _content.css(base.sDimension, base.fSizePerContent + 'px');
            if(_element.length === 1 && base.sDimension === 'height') {
              iMarginTop = parseInt((base.fSizePerContent - _element.height()) / 2, 10);
              _element.css('margin-top', String(iMarginTop) + 'px');
            }
          }
        }
        base.resizeVideoElements();
      }
      else if(base._target.length > 0) {
        base._el.css('display', 'none');
      }
      base.showTargetImage(_oFirstImage);
    },

    centerControls: function() {
      var base = this;

      if(!base.options.bShowControls) return;
      var iPosition = Math.ceil((base._el.height() - base._leftcontrol.height()) / 2),
          sPosition = base.sDimension === 'width' ? 'top' : 'left';

      if(base.sDimension === 'height') {
        iPosition = Math.ceil((base._el.width() - base._leftcontrol.width()) / 2);
      }
      base._leftcontrol.css(sPosition, iPosition + 'px');
      base._rightcontrol.css(sPosition, iPosition + 'px');
    },

    onEndResize: function() {
      var base = this;
      base.calculateOnResize();
      base.animateRotate(base.iCurrent);
      base._container.find('.carousel-images-content').each(function(index, el) {
        _(el).css(base.sDimension, base.iMaxSize + 'px');
      });
      base.centerControls();
    },

    customResize: function() {
      var base = this;

      base.pause(base);
      base.calculateOnResize();
      base.buildInnerContent();
      base.centerControls();
      base.manageControls(base.iCurrent);
      base.play(base);
    },

    calculateOnResize: function() {
      var base = this;

      base.iMaxSize = (base.options.sPosition === 'horizontal') ? base._el.width() : base._el.height();
      base.fLessPerContent = 0;
      base.fSizePerContent = 0;
      base.fMaxMargin = 0;
      if(base.bContinue) {
        base.fLessPerContent = parseFloat((base.iMaxSize / base.iInitialNumberImages) / 2).toFixed(2);
        base.fSizePerContent = parseFloat((base.iMaxSize - base.fLessPerContent) / base.iInitialNumberImages).toFixed(2);
        base.fMaxMargin = ((base.iNumberContents - base.iInitialNumberImages) * base.fSizePerContent - base.fLessPerContent) * -1;
      }

      if(base.options.sPosition === 'vertical') {
        if(base.options.bSameWidth) {
          base.iMaxSize = base.options.iMaxHeight;
        }

        base._el.css('height', base.iMaxSize + 'px');
      }

      if(base.options.iNumberImages === 1) {
        base.fSizeOfImage = 100;
        base.fPaddingOfImage = 0;
      }
      else {
        base.fSizeOfImage = (90 / base.options.iNumberImages).toFixed(5);
        base.fPaddingOfImage = (9 / base.options.iNumberImages).toFixed(5);
      }

      if(!base.bContinue) base._container.css(base.sDimension, base.iNumberContents * base.iMaxSize + 'px');
      else base._container.css(base.sDimension, base.iNumberContents * base.fSizePerContent + 'px');
    },

    resizeVideoElements: function() {
      var base = this,
          iMaxSizeElement = 9999;

      if(base.sDimension === 'height' && base.bContinue) return;
      if(base._container.find('.video-element')) {
        base._container.find('.carousel-element:not(.video-element)').each(function(index, el) {
          var _el = _(el),
              compare = base.sDimension === 'width' ? _el.height() : _el.width();
          if(compare < iMaxSizeElement) {
            iMaxSizeElement = compare;
          }
        });

        base._container.find('.video-element').each(function(index, el) {
          _(el).css(base.sDimension === 'width' ? 'height' : 'width', iMaxSizeElement + 'px');
        });
      }
    },

    cleanContent: function() {
      var base = this,
          shtml = base._el.html();

      shtml = shtml.replace(/[\u200B-\u200D\uFEFF]/g, '');
      shtml = shtml.replace(/(<p[^>]*>|<\/p>)/g, '');
      base._el.html(shtml);
    },

    cleanItems: function() {
      var base = this;

      base._items.each(function(index, el) {
        _(el).attr('style', '');
      });
    },

    setVars: function() {
      var base = this;

      if(base.options.iDuration) {
        base.iTimer = base.options.iDuration > 0 ? base.options.iDuration : 5;
      }
      base.iCurrent = 0;
      base.sDimension = base.options.sPosition === 'horizontal' ? 'width' : 'height';
      base.bContinue = base.options.bContinue;
      base.bHover = false;
      base._items = base._el.find('.carousel-element');
      base._target = _("#" + base.options.sTarget);
      base.iNumberContents = Math.ceil(base._items.length / base.options.iNumberImages);
      base.iInitialNumberImages = 0;
      base.iCurrentMargin = 0;
      if(base.bContinue) {
        base.iInitialNumberImages = base.options.iNumberImages;
        base.options.iNumberImages = 1;
        base.iNumberContents = base._items.length;
        base.options.bShowControlList = false;

        if(base.iNumberContents <= base.iInitialNumberImages) {
          base.options.bShowControls = base.options.bAutoplay = base.options.bShowControlList = base.options.bShowCounter = base.options.bShowPlayControl = false;
        }
      }
      else if(base.iNumberContents === 1) {
        base.options.bShowControls = base.options.bAutoplay = base.options.bShowControlList = base.options.bShowCounter = base.options.bShowPlayControl = false;
      }
    }
  };

  jQuery.fn.carousel = function (options) {
    return this.each(function () {
      if (_(this).data("carousel-init") === true) {
        return false;
      }
      _(this).data("carousel-init", true);
      var oObj = Object.create(Carousel);
      oObj.init(options, this);
      _.data(this, "carousel", oObj);
    });
  };

  // Opciones por defecto
  jQuery.fn.carousel.options = {
    // Eventos
    afterMove: false,
    beforeMove: false,
    customControlList: false,
    onAfterCompute: false,
    onBeforeCompute: false,
    onClickTarget: false,
    // Variables
    bAutoplay: true,
    bContinue: false,
    bSameWidth: false,
    bShowControlList: false,
    bShowControls: true,
    bShowCounter: false,
    bShowInfo: false,
    bShowPlayControl: false,
    iDuration: 5,
    iMaxHeight: 500,
    iNumberImages: 3,
    iSpeedAnimation: 400,
    sCounterLbl: "",
    sExtraClass: "",
    sHeightPerElement: "",
    sPosition: "horizontal",
    sTarget: "",
    sTypeAnimation: "linear"
  };
})(jQuery, window, document);
