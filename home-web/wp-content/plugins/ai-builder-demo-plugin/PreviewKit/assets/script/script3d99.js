/* Open/close Customization popup.*/
function tbdemo_customize_container(show) {
  if ( show ) {
    jQuery(".tbdemo-customize-container").show();
    jQuery(".tbdemo-customize").hide();
    jQuery(".tbdemo-customize-close").show();
    document.cookie = "tbdemo_customise_open=1; path=/";
  }
  else {
    jQuery(".tbdemo-customize-container").hide();
    jQuery(".tbdemo-customize").show();
    jQuery(".tbdemo-customize-close").hide();
    document.cookie = "tbdemo_customise_open=0; path=/";
    tbdemo_setCookie('tbdemo_first_time', 0);
  }
}

jQuery(window).on("scroll", function () {
  if (tbdemo_getCookie("tbdemo_first_time") != 0) {
    tbdemo_customize_container(false);
  }
});

jQuery(document).ready(function () {
  jQuery(".tbdemo-customize").on('click', function () {
    tbdemo_customize_container(true);
  });
  jQuery(".tbdemo-customize-close, .tbdemo-customize-container-overlay").on('click', function () {
    tbdemo_customize_container(false);
  });
  if ( tbdemo_getCookie("tbdemo_first_time") != 0 ) {
    tbdemo_customize_container(true);
  }

  let tbdemo_theme = getCookie('tbdemo_theme');
  if( tbdemo_theme != "" ) {
      change_kit_theme( tbdemo_theme );
      /* Do not show in mobile iframe */
      if ( window.self === window.top ) {
        /* Automatically show customise popup only if it was opened in previous page */
        if ( getCookie('tbdemo_customise_open') == 1 ) {
          tbdemo_customize_container(true);
        }
        jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
        jQuery(".tbdemo-theme-item.tbdemo-"+tbdemo_theme.toLowerCase()).addClass("tbdemo-theme-selected");
      }
  } else {
      /* Active theme in all_kit.json */
      jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
      jQuery(".tbdemo-theme-item.tbdemo-"+tbdemo.active_theme).addClass("tbdemo-theme-selected");
      document.cookie = "tbdemo_theme=" + tbdemo.active_theme + "; path=/";
  }

  jQuery(".tbdemo-theme-item").on('click', function () {
    jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
    jQuery(this).addClass("tbdemo-theme-selected");
    let theme = jQuery(this).data('key');
    document.cookie = "tbdemo_theme=" + theme + "; path=/";
    change_kit_theme( theme );
  });
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
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

function change_kit_theme( theme ) {
  if( typeof tbdemo.kitSettings[theme] === 'undefined') {
    return;
  }
  let kitSettings = tbdemo.kitSettings[theme];
  let id;
  let iframeBody = jQuery("#tbdemo-device-iframe").contents().find("body");
  for (const key in kitSettings) {
    if( key == "system_typography" || key == "custom_typography" ) {
        kitSettings[key].forEach( function( el ) {
          let id = el['_id'];
          let font_size = el['typography_font_size']["size"]+el['typography_font_size']["unit"];
          jQuery('body').css('--e-global-typography-' + id + '-font-family', el['typography_font_family']);
          jQuery('body').attr("tbdemo_theme", theme);
          /* For changing styles in mobile view iframe */
          if( iframeBody.length ) {
            iframeBody.css('--e-global-typography-' + id + '-font-family', el['typography_font_family']);
            iframeBody.attr("tbdemo_theme", theme);
          }
        });
    }
    else if( key !== "front_data" ) {
        kitSettings[key].forEach( function( el ) {
          let id = el['_id'];
          jQuery('body').css( '--e-global-color-'+id , el['color'] );
          /* For changing styles in mobile view iframe */
          if( iframeBody.length ) {
            iframeBody.css( '--e-global-color-'+id , el['color'] );
          }
        });
    }
  }
}