
jQuery( document ).keyup( function ( e ) {
  if ( e.key == 'Escape') {
    tbdemo_hide_editor();
  }
} );

jQuery( window ).on( "load", function() {
  setTimeout(change_cart_page_url, 2000);

  jQuery( document.body ).on( 'updated_cart_totals', function(){
    change_cart_page_url();
  });
});

function change_cart_page_url() {
  if ( typeof taa.home_permalink !== "undefined" && taa.home_permalink != "" ) {
    jQuery(".elementor-button--view-cart").each(function (index) {
      jQuery(this).attr("href", taa.home_permalink + 'cart/');
    });
    jQuery(".elementor-button--checkout, .checkout-button").each(function (index) {
      jQuery(this).attr("href", taa.home_permalink + 'checkout/');
    });
  }
}

jQuery(document).ready(function () {
  /* Remove in Elementor edit page preview iframe */
  if ( window.self !== window.top ) {
    jQuery(document).find(".tbdemo-sharebar-container,.tbdemo-ai-popup-layout,.tbdemo-ai-popup-container,.tbdemo-customize-container").remove();
  }
  let guest = tbdemo_getCookie("tbdemo") ? false : true;
  guest = false;
  tbdemo_showTypeform();
  if(guest){
    jQuery("body").addClass('tbdemo_guest');
  }else{
    jQuery("body").addClass('tbdemo_owner');
  }

  tbdemo_change_domain_id_url();

  jQuery(".tbdemo-circle-icon-content .tbdemo-share-button").parent().on("click", function () {
    jQuery(".tbdemo-big-popup, .tbdemo-big-popup-overlay").show();
  });
  jQuery(".tbdemo-big-popup-close, .tbdemo-big-popup-overlay, .tbdemo-button-promo-got-it").on("click", function () {
    jQuery(".tbdemo-big-popup, .tbdemo-big-popup-overlay").hide();
  });

  jQuery(".tbdemo-popup-copyied").on("click", function () {
    jQuery(this).html("Copied");
    let text_to_copy = "";
    let cont = jQuery(this).parent().find(".tbdemo-popup-text-to-copy");
    if ( typeof cont.data("text") != "undefined" ) {
      text_to_copy += cont.data("text") + " ";
    }
    text_to_copy += cont.html();
    navigator.clipboard.writeText(text_to_copy);
    setTimeout(tbdemo_resetToCopy, 2000, jQuery(this));
  });

  if (guest) {
    jQuery(".tf-v1-popover").hide();
    jQuery(".tbdemo-guest").show();
    jQuery(".twbb-pu-bottom-bar").hide();
    tbdemo_change_position();
  }
  else {
    jQuery(".tbdemo-owner").show();
    if (taa.is_home == 1) {
      // Auto open "One week free" popup once on scrolled Homepage up to 70%.
      jQuery(window).on("scroll", function () {
        let displayed_1wf = tbdemo_getCookie('tbdemo_1WF_' + taa.home_page_id);
        if ( jQuery(".tbdemo-editor-cont").length !== 1 && !displayed_1wf && displayed_1wf === "" && tbdemo_amountscrolled() > 70) {
          tbdemo_setCookie('tbdemo_1WF_' + taa.home_page_id, true);
          tbdemo_show_upgrade_popup("Page scroll");
        }
      });
    }
    else {
      // Auto open Typeform on all pages except Homepage for desktop every time until form submit .
      let displayed_typeform = tbdemo_getCookie('tbdemo_submitted_typeform_' + taa.home_page_id);
      if ( !displayed_typeform && displayed_typeform === "" ) {
        if (jQuery(window).width() > 860) {
          jQuery(".tf-v1-popover-button").click();
        }
      }
    }
  }

  /* Add tooltips to the buttons hover.*/
  jQuery(".tbdemo-circle-icon:not(.tbdemo-close-circle)").hover(function () {
      let cont = jQuery("<div>", {
        class: "tbdemo-tooltip",
        html: jQuery(this).parent().data("tooltip")
      });
      cont.css({"bottom": 22 + 81 * (2 - jQuery(this).parent().index()) + 15});
      jQuery(".tbdemo-sharebar-container").after(cont);
    },
    function () {
      jQuery(".tbdemo-tooltip").remove();
    });

  jQuery(".tbdemo-circle-icon-border .tbdemo-edit").on("click", function() {
    if ( jQuery(window).width() < 1025 ) {
      tbdemo_show_upgrade_popup("Mobile edit button click");
    }
    else {
      tbdemo_show_editor();
    }
  });

  jQuery(".tbdemo-pro").on("click", function() {
    tbdemo_show_upgrade_popup("Pro button click");
  });

  jQuery(".tbdemo-customize-edit-button").on("click", function() {
    tbdemo_show_upgrade_popup("Customize button click");
    tbdemo_customize_container(false);
  });

  jQuery(".tbdemo-madebar-border-container").show();

  jQuery(".tf-v1-popover-button").on('click', function () {
    tbdemo_setCookie('tbdemo_displayed_typeform', true);
  });

  jQuery(".twbb-pu-upgrade-layout, .twbb-pu-upgrade-close").on("click", function() {
     jQuery("html").removeAttr("style");
  })

  let window_size = jQuery(window).width();
  if( window_size < 550 ) {
    tbdemo_swipePrice( window_size )
  }

  jQuery(document).find(".tbdemo-popup-share-button").on({
    mouseenter: function () {
      jQuery(this).find(".tbdemo-popup-share-button-tooltip").show();
    },
    mouseleave: function () {
      jQuery(this).find(".tbdemo-popup-share-button-tooltip").hide();
    }
  });

  jQuery(".tbdemo-edit-close").on('click', function () {
    tbdemo_hide_editor();
  });
});

function tbdemo_show_editor() {
  jQuery(".tbdemo-edit-close").show();
  let cont = jQuery("<div>", {
    class: "tbdemo-editor-cont",
    onClick: "tbdemo_show_upgrade_popup(\"Left bar click\")"
  });

  jQuery("body").addClass("tbdemo-editor-mode");
  jQuery("body").before(cont);
  jQuery(".tbdemo-editor-cont").before("<div class=\"tbdemo-editor-top-bar\">");

  let add_page_link = twbb.tenweb_dashboard + '/websites/' + twbb.dashboard_website_id + '/ai-builder?add_page=1';
  let add_dashboard_link = twbb.tenweb_dashboard + '/websites/' + twbb.dashboard_website_id + '/ai-builder?from_demo=1';
  let add_page_btn = jQuery("<a>", {
    class: "tbdemo-add-page",
    html: "Add Page",
    onClick: "window.open(\"" + add_page_link + "\")"
  });
  jQuery(".tbdemo-editor-top-bar").append(add_page_btn);

  let dashboard_btn = jQuery("<a>", {
    class: "tbdemo-dashboard",
    html: "10Web Dashboard",
    onClick: "window.open(\"" + add_dashboard_link + "\")"
  });
  jQuery(".tbdemo-editor-top-bar").append(dashboard_btn);

  jQuery(".tbdemo-editor-cont").append("<div class='tbdemo-editor-top'>");
  jQuery(".tbdemo-editor-cont").append("<div class='tbdemo-editor-basic'>");

  jQuery(".tbdemo-madebar-border-container").hide();
  jQuery(".tbdemo-edit").hide();
  //jQuery(".tbdemo-edit").parent().show();
  jQuery("#tbdemo-device-iframe").css({"top": "44px"});

  tbdemo_animate(true);
}

/** Show the fake editor with animation.
 *
 * @param open
 */
function tbdemo_animate(open) {
  jQuery(".tbdemo-editor-top-bar").css({
    height: open ? 0 : "44px"
  }).animate({
    height: open ? "44px" : 0
  }, "slow");
  jQuery(".elementor-sticky--active").css({
    top: open ? 0 : "44px"
  }).animate({
    top: open ? "44px" : 0
  }, "slow");
  jQuery(".tbdemo-editor-cont, .tbdemo-editor-top").css({
    left: open ? "-222px" : 0
  }).animate({
    left: open ? 0 : "-222px"
  }, "slow");
  let calc = jQuery(window).width() - 222 + "px";
  jQuery("body.tbdemo-editor-mode").css({
    left: open ? 0 : "222px",
    top: open ? 0 : "44px",
    width: open ? "100%" : calc,
  }).animate({
    left: open ? "222px" : 0,
    top: open ? "44px" : 0,
    width: open ? calc : "100%",
  }, "slow", function() {
    if ( open ) {
      tbdemo_fake_editor_marker();
    }
    else {
      tbdemo_hide_editor_complete();
    }
  });
}

/**
 *  The function to call on close animation end.
 *  */
function tbdemo_hide_editor_complete() {
  jQuery("body").removeClass("tbdemo-editor-mode");
  jQuery(".tbdemo-editor-cont, .tbdemo-editor-top-bar").remove();
  jQuery(".tbdemo-madebar-border-container, .tbdemo-sharebar-container").show();
  jQuery("#tbdemo-device-iframe").css({"top": 0});
  jQuery(".tbdemo_selected_area, .tbdemo_container_edit_settings, .tbdemo_eicon").remove();
  jQuery(".tbdemo-edit").show();
  jQuery(".tbdemo-edit-close").hide();
  let iframe = jQuery('#tbdemo-device-iframe').contents();
  iframe.find(".tbdemo_selected_area, .tbdemo_container_edit_settings, .tbdemo_eicon").remove();
}

function tbdemo_hide_editor() {
  tbdemo_animate(false);
}

function tbdemo_fake_editor_marker() {
  let iframe = jQuery('#tbdemo-device-iframe').contents();
  iframe.find(".tbdemo_selected_area, .tbdemo_container_edit_settings, .tbdemo_eicon").remove();
  jQuery(".tbdemo_selected_area, .tbdemo_container_edit_settings, .tbdemo_eicon").remove();
  let coming_soon_controls = [
    "image",
    "selected_icon",
    "social_icon",
    "selected_active_icon",
    "dismiss_icon",
    "testimonial_image",
    "custom_css",
    "html",
  ]

  let container_edit_icons = "<div class='tbdemo_container_edit tbdemo_selected_area'></div><ul class='tbdemo_eicon tbdemo_container_edit_settings'>";
      container_edit_icons += "<li class='tbdemo_container_edit_settings-add' title='Add Container'>";
      container_edit_icons += "<i class='eicon-plus' aria-hidden='true'></i>";
      container_edit_icons += "</li>";
      container_edit_icons += "<li class='tbdemo_container_edit_settings-edit' title='Edit Container'>";
      container_edit_icons += "<i class='eicon-handle' aria-hidden='true'></i>";
      container_edit_icons += "</li>";
      container_edit_icons += "<li class='tbdemo_container_edit_settings-remove' title='Delete Container'>";
      container_edit_icons += "<i class='eicon-close' aria-hidden='true'></i>";
      container_edit_icons += "</li>";
      container_edit_icons += "</ul>";

  if ( window.self === window.top ) {
    jQuery(".elementor-section-wrap > [data-element_type='container']").each( function() {
      jQuery(this).append(container_edit_icons);
      jQuery(this).find("div[data-element_type='container']").append("<div class='tbdemo_column_edit tbdemo_selected_area'></div><i class='tbdemo_eicon tbdemo_eicon-handle eicon-handle'></i>");
      let widget = jQuery(this).find("div[data-element_type='widget']");

      widget.each( function() {
        let e = jQuery(this);
        e.append("<div class='tbdemo_widget_edit tbdemo_selected_area'></div><i class='tbdemo_eicon tbdemo_eicon-edit eicon-edit'></i>");

        let widget_type =  e.data("widget_type").replace('.default', '');
        if ( ! coming_soon_controls.includes( widget_type ) ) {
          e.find(".tbdemo_selected_area").append("<i class='tbdemo_eicon tbdemo_eicon-regenerate'>Regenerate</i>");
        }
      })


    });
  }

  jQuery(iframe).find(".elementor-section-wrap > [data-element_type='container']").each( function() {
    jQuery(this).append(container_edit_icons);
    jQuery(this).find("div[data-element_type='container']").append("<div class='tbdemo_column_edit tbdemo_selected_area'></div><i class='tbdemo_eicon tbdemo_eicon-handle eicon-handle'></i>");
    jQuery(this).find("div[data-element_type='widget']").append("<div class='tbdemo_widget_edit tbdemo_selected_area'></div><i class='tbdemo_eicon tbdemo_eicon-edit eicon-edit'></i>");
    let widget = jQuery(this).find("div[data-element_type='widget']");
    widget.each( function() {
      let e = jQuery(this);
      e.append("<div class='tbdemo_widget_edit tbdemo_selected_area'></div><i class='tbdemo_eicon tbdemo_eicon-edit eicon-edit'></i>");

      let widget_type =  e.data("widget_type").replace('.default', '');
      if ( ! coming_soon_controls.includes( widget_type ) ) {
        e.find(".tbdemo_selected_area").append("<i class='tbdemo_eicon tbdemo_eicon-regenerate'>Regenerate</i>");
      }
    })
  });

  tbdemo_hover_action( jQuery(document) );
  tbdemo_hover_action( iframe );
}

function tbdemo_hover_action( cont ) {
   jQuery(cont).find(".tbdemo_selected_area, .tbdemo_eicon")
     .on( "mouseenter", function(e) {
         e.preventDefault();
          jQuery( this ).parents().children(".tbdemo_selected_area").css("opacity", 1).next(".tbdemo_eicon").css("opacity", 1);
     })
      .on( "mouseleave", function(e) {
         e.preventDefault();
        jQuery(cont).find(".tbdemo_selected_area, .tbdemo_eicon:not(.tbdemo_eicon-regenerate)").css("opacity", 0);
      });

      jQuery(cont).find(".tbdemo_selected_area, .tbdemo_eicon:not(.tbdemo_eicon-regenerate)").on("click", function(e) {
        if( jQuery(e.target).hasClass('tbdemo_eicon-regenerate') ) {
          return;
        }
        tbdemo_show_upgrade_popup("Site content click");
      });

      jQuery(cont).on("click", ".tbdemo_eicon-regenerate", function(){
        let prompt = jQuery(this).parent().parent().find(".elementor-widget-container").text();
        prompt = prompt.trim();
        tbdemo_show_ai_popup(prompt);
        jQuery(cont).find(".tbdemo-ai-description-input").val(prompt).change();
      });


}

function tbdemo_show_upgrade_popup(type) {
  jQuery(".twbb-pu-upgrade-layout, .twbb-pu-upgrade-container").removeAttr("style").removeClass("twbb-pu-hidden");
  twbb_pu_run_video(jQuery(".twbb-pu-video-active"));
  jQuery("html").css("overflow", "hidden");
  if ( typeof dataLayer != "undefined" ) {
    dataLayer.push({
      event: '10web-event',
      'eventCategory': 'Free Upgrade Offer',
      'eventAction': 'Locked button click',
      'eventLabel': 'AI Builder Demo: ' + type
    });
  }
}

function tbdemo_showTypeform(){
  var wrapperElement = document.getElementById('tf-v1-popover');
  if ( typeof wrapperElement == "undefined" || wrapperElement == null ) {
    jQuery(".tbdemo-circle-icon-border-typform").css("visibility", "hidden");
    return;
  }
  var formId = "cVkeS1iz";
  window.tf.createPopover(
    formId,
    {
      container: wrapperElement,
      hideHeaders: true,
      hideFooter: true,
      autoClose: 3000,
      customIcon: "https://images.typeform.com/images/7BGNBNtFKvBc",
      hidden: {
        site_url: window.location.href,
      },
      onSubmit: (event) => {
        tbdemo_setCookie('tbdemo_submitted_typeform_' + taa.home_page_id, true);
      },
      onReady: (event) => {
        // Disable tooltip.
        jQuery(".tbdemo-tooltip").removeClass("tf-v1-popover").hide();
      },
      onClose : (event) => {
        // Enable tooltip.
        jQuery(".tbdemo-tooltip").addClass("tf-v1-popover");
      },
    },
  )
}

function tbdemo_change_url_param( url, param, value ) {
  url = new URL(url);
  let search_params = url.searchParams;
  search_params.set(param, value);
  url.search = search_params.toString();
  return url.toString();
}

function tbdemo_swipePrice( window_size ) {
  jQuery(".tbdemo-upgrade-price-content").on("swipeleft", function (e) {
    e.preventDefault();
    let left = jQuery(window).width() - 575;
    jQuery(this).animate({"left": left + "px"});
  });
  jQuery(".tbdemo-upgrade-price-content").on("swiperight", function (e) {
    e.preventDefault();
    jQuery(this).animate({"left": "15px"});
  });
}

function tbdemo_amountscrolled(){
  var winheight= window.innerHeight || (document.documentElement || document.body).clientHeight;
  var docheight = tbdemo_getDocHeight();
  var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
  var trackLength = docheight - winheight;
  return Math.floor(scrollTop/trackLength * 100);
}

function tbdemo_getDocHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  )
}

jQuery(window).resize(function () {
  let guest = tbdemo_getCookie("tbdemo") ? false : true;
  if (guest) {
    tbdemo_change_position();
  }
});

function tbdemo_change_position() {
  if ( !jQuery("body").hasClass("tbdemo-editor-mode") ) {
    if (jQuery(window).width() <= 860) {
      jQuery("body").css("padding-top", "128px");
    }
    else {
      jQuery("body").css("padding-top", "60px");
    }
  }
}


function tbdemo_change_domain_id_url() {
  if( typeof twbb_sidebar_vars === 'undefined' ) return;
  let str = twbb_sidebar_vars.upgrade_url;


  const regex = /websites\/(\d+)\//gm;

  let m;
  let domain_id = tbdemo_getCookie("tbdemo_domain_id");
  if (!domain_id) {
    return;
  }

  let mathch1 = "";
  let mathch2 = "";
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    mathch1 = m[0];
    mathch2 = m[1];
  }

  twbb_sidebar_vars.upgrade_url = str.replace(mathch1, mathch1.replace(mathch2, domain_id));
}

function tbdemo_setCookie(cname, cvalue, exdays) {
  if ( typeof exdays == "undefined" ) {
    var exdays = 3650;
  }
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function tbdemo_getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function tbdemo_resetToCopy( that ) {
  jQuery(that).html("Copy");
}

/**
 * Run the loader for the given button.
 * @param that
 */
function tbdemo_run_loader(that) {
  if( !that.hasClass("tbdemo-button-disabled") ) {
    return;
  }
  that.addClass("tbdemo-button-loading");
  setTimeout(function () {
    that.removeClass("tbdemo-button-loading tbdemo-button-disabled");
  }, 2000);
}
