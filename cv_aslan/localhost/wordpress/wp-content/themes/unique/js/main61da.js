/*
* Theme Name: Unique - Responsive vCard
* Author: lmpixels
* Author URL: http://themeforest.net/user/lmpixels
* Version: 2.6.2
*/

(function($) {
"use strict";

    var dir = $("html").attr("dir"),
    rtlVal = false,
    masonryVal = true;

    if (dir == 'rtl') {
        rtlVal = true;
        masonryVal = false;
    }
    else {
        rtlVal = false;
        masonryVal = true;
    }

    function imageCarousel() {
        $('.portfolio-page-carousel').imagesLoaded(function () {
            $('.portfolio-page-carousel').owlCarousel({ // Portfolio page carousel
                smartSpeed:1200,
                items: 1,
                loop: true,
                dots: true,
                nav: true,
                navText: false,
                autoHeight: true,
                margin: 10,
                rtl: rtlVal
            });
        });
    }
        
    // Portfolio subpage filters
    function portfolio_init() {
        $( '.portfolio-content' ).each( function() {
            var portfolio_grid_container = $(this),
                portfolio_grid_container_id = $(this).attr('id'),
                portfolio_grid = $('#' + portfolio_grid_container_id + ' .portfolio-grid'),
                portfolio_filter = $('#' + portfolio_grid_container_id + ' .portfolio-filters'),
                portfolio_filter_item = $('#' + portfolio_grid_container_id + ' .portfolio-filters .filter');
                
            if (portfolio_grid) {

                portfolio_grid.shuffle({
                    speed: 450,
                    itemSelector: 'figure'
                });

                $('.site-auto-menu').on("click", "a", function (e) {
                    portfolio_grid.shuffle('update');
                });

                portfolio_filter.on("click", ".filter", function (e) {
                    portfolio_grid.shuffle('update');
                    e.preventDefault();
                    portfolio_filter_item.parent().removeClass('active');
                    $(this).parent().addClass('active');
                    portfolio_grid.shuffle('shuffle', $(this).attr('data-group') );
                });

            }
        })
    }
    // /Portfolio subpage filters

    // Ajax Pages loader
    function ajaxLoader() {
        // Check for hash value in URL
        var ajaxLoadedContent = $('#page-ajax-loaded');

        function showContent() {
            ajaxLoadedContent.removeClass('rotateOutDownRight closed');
            ajaxLoadedContent.show();
        }

        function hideContent() {
            $('#page-ajax-loaded').addClass('rotateOutDownRight closed');
            setTimeout(function(){
                $('#page-ajax-loaded.closed').html('');
                ajaxLoadedContent.hide();
                ajaxLoadedContent.append('<div class="preloader"><div class="preloader-animation"><div class="dot1"></div><div class="dot2"></div></div></div>');
            }, 500);
        }

        function customAjaxScroll() {
            var windowWidth = $(window).width();
            if (windowWidth > 991) {
                // Custom Ajax Page Scroll
                $("#portfolio-page").mCustomScrollbar({
                    scrollInertia: 8,
                    documentTouchScroll: false,
                    advanced:{ autoUpdateTimeout: 10 }
                });
            } else {
                $("#portfolio-page").mCustomScrollbar('destroy');
            }
        }

        $(document)
            .on("click",".site-auto-menu, #portfolio-page-close-button", function (e) { // Hide Ajax Loaded Page on Navigation cleck and Close button
                e.preventDefault();
                hideContent();
            })
            .on("click",".ajax-page-load", function () { // Show Ajax Loaded Page
                var toLoad =  $(this).attr('href') + '?ajax=true';
                showContent();
                ajaxLoadedContent.load(toLoad, function() {
                    // Ajax Loaded Page Scroll
                    customAjaxScroll();
                    imageCarousel();
                    // Gallery grid init
                    var $gallery_container = $("#portfolio-gallery-grid");
                    $gallery_container.imagesLoaded(function () {
                        $gallery_container.masonry({
                            isOriginLeft: masonryVal
                        });
                    });

                    $('.portfolio-page-wrapper .portfolio-grid').each(function() {
                        $(this).magnificPopup({
                            delegate: 'a.gallery-lightbox',
                            type: 'image',
                            gallery: {
                              enabled:true
                            }
                        });
                    });

                    lazyVideo();
                });

                return false;
            });
    }
    // /Ajax Pages loader

    // Contact form validator
    $(function () {
        $( '.contact-form' ).each( function() {
            var contact_form_id = $(this).attr('id'),
                contact_form = $('#' + contact_form_id + '.contact-form');

            contact_form.validator();

            contact_form.on('submit', function (e) {
                if (!e.isDefaultPrevented()) {

                    $.ajax({
                        type: "POST",
                        url: ajaxurl,
                        data: $(this).serialize()+'&action=unique_contact_action',
                        success: function (data)
                        {   
                            var result = JSON.parse(data);
                            var messageAlert = 'alert-' + result.type;
                            var messageText = result.message;

                            var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
                            if (messageAlert && messageText) {
                                contact_form.find('.messages').html(alertBox);
                                if (messageAlert == "alert-success") {
                                    $('.contact-form')[0].reset();
                                }
                            }
                        },
                    });
                    return false;
                }

            });
        });
    });
    // /Contact form validator

    // Hide Mobile menu
    function mobileMenuHide() {
        var windowWidth = $(window).width();
        if (windowWidth < 1024) {
            $('#site_header').addClass('mobile-menu-hide');
        }
    }
    // /Hide Mobile menu

    // Lazy Video Loading
    function lazyVideo() {
        var youtube = $('.embed-youtube-video'),
            vimeo = $('.embed-vimeo-video');

        youtube.each(function() {
            var video_wrap = $(this),
            id = $(this).attr('data-embed'),
            id = id.split('youtube.com/embed/index.html')[1];

            var thumb_url = "//img.youtube.com/vi/"+id+"/0.jpg";
            $('<img width="100%" src="'+thumb_url+'" />').appendTo($(this));

            $(this).on("click", "div.play-button", function (e) {
                var $video_iframe = $('<iframe class="embed-responsive-item" src="//www.youtube.com/embed/' + id + '?rel=0&showinfo=0&autoplay=1&output=embed" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                $video_iframe.appendTo(video_wrap);
                $(this).hide();
            });
        });

        vimeo.each(function() {
            var video_wrap = $(this),
            id = $(this).attr('data-embed'),
            id = id.split('vimeo.com/video/index.html')[1];

            $('<img class="vimeo-thumb" width="100%" src="" />').appendTo($(this));

            $.getJSON('https://www.vimeo.com/api/v2/video/' + id + '.json?callback=?', {format: "json"}, function(data) {
                video_wrap.children(".vimeo-thumb").attr('src', data[0].thumbnail_large);
            });

            $(this).on("click", "div.play-button", function (e) {
                var $video_iframe = $('<iframe class="embed-responsive-item" src="//player.vimeo.com/video/' + id + '?autoplay=1&loop=1&autopause=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                $video_iframe.appendTo(video_wrap);
                $(this).hide();
            });
        });
    }
    // /Lazy Video Loading

    // Custom scroll
    function customScroll() {
        var windowWidth = $(window).width();
        if (windowWidth > 991) {
            // Custom Subpage Scroll
            $(".pt-page").mCustomScrollbar({
                scrollInertia: 88,
                documentTouchScroll: false
            });

            // Custom Header Scroll
            $("#site_header").mCustomScrollbar({
                scrollInertia: 88,
                documentTouchScroll: false
            });

            // Custom Content Scroll
            $("#content-scroll").mCustomScrollbar({
                scrollInertia: 88,
                documentTouchScroll: false
            });

            // Custom Blog Sidebar Scroll
            $(".blog-sidebar-scroll").mCustomScrollbar({
                scrollInertia: 88,
                documentTouchScroll: false
            });
        } else {
            $(".pt-page").mCustomScrollbar('destroy');
            $("#site_header").mCustomScrollbar('destroy');
            $("#content-scroll").mCustomScrollbar('destroy');
            $(".blog-sidebar-scroll").mCustomScrollbar('destroy');
        }
    }
    // /Custom scroll

    //On Window load & Resize
    $(window)
        .on('load', function() { //Load
            // Animation on Page Loading
            $("body > .preloader").fadeOut("slow");
        })
        .on('resize', function() { //Resize
            mobileMenuHide();

            customScroll();
        });


    // On Document Load
    $(document).on('ready', function() {
        // initializing page transition.
        var ptPage = $('.subpages');
        if (ptPage[0]) {
            PageTransitions.init({
                menu: 'ul.site-auto-menu',
            });
        }

        // Initialize Portfolio grid
        var $portfolio_container = $(".portfolio-grid"),
            $gallery_container = $("#portfolio-gallery-grid");

        $gallery_container.imagesLoaded(function () {
            $gallery_container.masonry();
        });

        $portfolio_container.imagesLoaded(function () {
            portfolio_init(this);
        });

        $('.portfolio-page-carousel').imagesLoaded(function () {
            $('.portfolio-page-carousel').owlCarousel({ // Portfolio page carousel
                smartSpeed:1200,
                items: 1,
                loop: true,
                dots: true,
                nav: true,
                navText: false,
                autoHeight: true,
                margin: 10,
                rtl: rtlVal
            });
        });

        // Portfolio hover effect init
        $(' .portfolio-grid > figure ').each( function() { $(this).hoverdir(); } );

        // Blog grid init
        var $container = $(".blog-masonry");
        $container.imagesLoaded(function () {
            $container.masonry({
                isOriginLeft: masonryVal
            });
        });

        // Image slider
        imageCarousel();

        // Gallery grid init
        var $gallery_container = $("#portfolio-gallery-grid");
        $gallery_container.imagesLoaded(function () {
            $gallery_container.masonry({
                isOriginLeft: masonryVal
            });
        });

        // Mobile menu
        $('.menu-toggle').on("click", function () {
            $('#site_header').toggleClass('mobile-menu-hide');
        });

        // Mobile menu hide on main menu item click
        $('.site-auto-menu').on("click", "a", function (e) {
            mobileMenuHide();
        });

        // Sidebar toggle
        $('.sidebar-toggle').on("click", function () {
            $('#blog-sidebar').toggleClass('open');
        });


        // Text rotation
        $('.text-rotation').owlCarousel({
            loop: true,
            dots: false,
            nav: false,
            margin: 10,
            items: 1,
            autoplay: true,
            autoplayHoverPause: false,
            autoplayTimeout: 3800,
            animateOut: 'zoomOut',
            animateIn: 'zoomIn',
            rtl: rtlVal
        });

        // Lightbox init
        $('body').magnificPopup({
            delegate: 'a.lightbox',
            type: 'image',
            removalDelay: 300,
            autoFocusLast: false,

            // Class that is added to popup wrapper and background
            // make it unique to apply your CSS animations just to this exact popup
            mainClass: 'mfp-fade',
            image: {
                // options for image content type
                titleSrc: 'title',
                gallery: {
                  enabled:false
                }
            },

            iframe: {
                markup: '<div class="mfp-iframe-scaler">'+
                        '<div class="mfp-close"></div>'+
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                        '<div class="mfp-title mfp-bottom-iframe-title"></div>'+
                      '</div>', // HTML markup of popup, `mfp-close` will be replaced by the close button

                patterns: {
                    youtube: {
                      index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).

                      id: null, // String that splits URL in a two parts, second part should be %id%
                      // Or null - full URL will be returned
                      // Or a function that should return %id%, for example:
                      // id: function(url) { return 'parsed id'; }

                      src: '%id%?autoplay=1' // URL that will be set as a source for iframe.
                    },
                    vimeo: {
                      index: 'vimeo.com/',
                      id: '/',
                      src: '//player.vimeo.com/video/%id%?autoplay=1'
                    },
                    gmaps: {
                      index: '//maps.google.',
                      src: '%id%&output=embed'
                    }
                },

                srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
            },

            callbacks: {
                markupParse: function(template, values, item) {
                    values.title = item.el.attr('title');
                }
            },
        });

        $('.ajax-page-load-link').magnificPopup({
            type: 'ajax',
            removalDelay: 300,
            mainClass: 'mfp-fade',
            gallery: {
                enabled: true
            },
        });

        $('.portfolio-page-wrapper .portfolio-grid').each(function() {
            $(this).magnificPopup({
                delegate: 'a.gallery-lightbox',
                type: 'image',
                gallery: {
                  enabled:true
                }
            });
        });

        $('.subpages, .content-area').append('<div id="page-ajax-loaded" class="page-portfolio-loaded animated rotateInDownRight" style="display: none"><div class="preloader"><div class="preloader-animation"><div class="dot1"></div><div class="dot2"></div></div></div></div>');
        ajaxLoader();

        lazyVideo();

        $('.pt-page-current').imagesLoaded(function () {
            customScroll();
            $(".preloader").fadeOut();
        });
    });

})(jQuery);
