(function (window, $, History) {

  var App = function () {
    this.$content = $('#content');
    this.$navigtation = $('#navigation');
    this.$items = this.$navigtation.find('li');
    this.$links = this.$items.find('a');
    this.$sidebar = $('#center').find('.sidebar');
    this.$sections = this.$sidebar.find('.sections');
    this.$scrollable = $('html, body');
    this.originalContent = '';
    this.originalLink = null;
    this.currentPage = null;
    this.init();
  };

  App.prototype.init = function () {
    this.loadContent(window.location.hash);
    this.$links.not('.external').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.loadContent(e.target.href.replace(/^.*#/, ''));
    }.bind(this));
    $(window)
      .on('hashchange', this.hashchange.bind(this))
      .on('statechange', this.statechange.bind(this))
      .on('scroll', function (e) {
        var top = this.$sections.offset().top - parseFloat(this.$sections.css('marginTop').replace(/auto/, 0));
        this.$sections[this.$scrollable.scrollTop() + 140 >= top ? 'addClass' : 'removeClass']('fixed');
      }.bind(this))
    ;
  };

  App.prototype.pageSections = function () {
    // Find new sections.
    var $sections = this.$content.find('.sections').hide().clone().show();
    if ($sections.length) {
      // Remove any current sections in the sidebar.
      this.$sections.remove();

      // Store the new sections.
      this.$sections = $sections;

      // Add the new sections.
      this.$sidebar.append(this.$sections);
    }
  };

  App.prototype.scrollToHash = function (array) {
    // wait a bit for the new content to load
    setTimeout(function () {
      // Scroll to top for main page
      if (array.length !== 2) {
        this.$scrollable.animate({ scrollTop: 0 }, 0);
        return;
      }

      // Attempt to get an ID anchor
      var $anchor = this.$content.find('#' + array[1]);
      if (!$anchor[0]) {
        $anchor = this.$content.find('[name="' + array[1] + '"]');
      }

      // Attempt to get a named anchor
      if ($anchor[0]) {
        this.$scrollable.animate({ scrollTop: $anchor.offset().top }, 0);
        $(window).trigger('scroll');
      }
    }.bind(this), 250);
  };

  App.prototype.getBaseUrl = function () {
    return window.location.href.replace(new RegExp('#' + this.getHash() + '$'), '');
  };

  App.prototype.getHash = function () {
    return window.location.hash.replace(/^#/, '');
  };

  App.prototype.newHashUrl = function (hash) {
    return this.getBaseUrl() + '#' + hash;
  };

  App.prototype.loadContent = function (hash) {
    hash = hash || '';
    hash = hash.replace(/^#/, '');
    var array = hash.split('/');
    hash = array[0];
    if (hash !== "") {
      if (hash !== this.currentPage) {
        if (this.originalContent === '') {
          this.originalLink = this.$items.filter('.active');
          this.originalContent = this.$content.html();
        }

        var $newLink = this.$links.filter('[href="#' + hash + '"]');
        if ($newLink[0]) {
          this.$items.removeClass('active');
          $newLink.parent().addClass('active');
        }

        // Load the page slugs.
        $.get('_' + hash.replace('!', '') + ".html", function (html) {
          this.$content.html(html);
          this.pageSections();
          this.scrollToHash(array);
        }.bind(this), 'html');
      }
      else {
        this.pageSections();
        this.scrollToHash(array);
      }
    }
    else if (this.originalContent !== '') {
      this.$items.filter('.active').removeClass('active');
      this.originalLink.addClass('active');
      this.$content.html(this.originalContent);
      this.pageSections();
      this.scrollToHash(array);
    }
    else {
      this.pageSections();
      this.scrollToHash(array);
    }
    this.currentPage = hash;
    window.history.pushState(null, null, this.newHashUrl(array.join('/')));
  };

  App.prototype.hashchange = function () {
    this.loadContent(window.location.hash);
  };

  App.prototype.statechange = function (e) {
    this.loadContent(e.state.href);
  };

  $(function () {
    window.app = window.app || new App();
  });

})(window, window.jQuery);
