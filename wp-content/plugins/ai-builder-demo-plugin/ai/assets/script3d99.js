let type = 'text'

jQuery(document).ready(function() {

  jQuery(document).on("click", ".tbdemo-ai-close, .tbdemo-ai-popup-layout", function(){
    tbdemo_hide_ai_popup();
  });

  jQuery(document).on("click", ".tbdemo-ai-new-prompt-button", function(){
    jQuery(".tbdemo-ai-error-message").hide();
    tbdemo_show_ai_popup( '' );
  });

  jQuery(document).on("click", ".tbdemo-ai-suggested-propmt", function(){
    let prompt = jQuery(this).text();
    jQuery(document).find(".tbdemo-ai-description-input").val(prompt).change();
  });

  jQuery(document).on("change paste keyup", ".tbdemo-ai-description-input", function(){
    if( jQuery(this).val() != '' ) {
      jQuery(".tbdemo-ai-propmts-empty-container .tbdemo-ai-suggested-propmts-content").hide();
    } else {
      jQuery(".tbdemo-ai-propmts-empty-container .tbdemo-ai-suggested-propmts-content").show();
    }
  });

  jQuery(document).on("click", ".tbdemo-ai-action-button, .tbdemo-ai-use-text-button", function(){
    tbdemo_hide_ai_popup();
    tbdemo_show_upgrade_popup("Site content click");
  });

  jQuery(document).on("click", ".tbdemo-ai-select-value", function() {
    jQuery(".tbdemo-ai-select-container").addClass("tbdemo-ai-select-closed");
    jQuery(".tbdemo-ai-select-options-container").hide();
    let parent = jQuery(this).closest(".tbdemo-ai-select-container");
    if( parent.hasClass("tbdemo-ai-select-closed") ) {
        parent.find(".tbdemo-ai-select-options-container").show();
        parent.removeClass("tbdemo-ai-select-closed");
    } else {
        parent.find(".tbdemo-ai-select-options-container").hide();
        parent.addClass("tbdemo-ai-select-closed");
    }
  });

  /* Close select if click on popup */
  jQuery(document).on("click", ".tbdemo-ai-popup-container", function(event ) {
    var target = jQuery( event.target );
    if( !target.is(".tbdemo-ai-select-container, .tbdemo-ai-select-value") ) {
      jQuery(".tbdemo-ai-select-options-container").hide();
      jQuery(".tbdemo-ai-select-container").addClass("tbdemo-ai-select-closed");
    }
  });
});

function tbdemo_hide_ai_popup() {
  jQuery(".tbdemo-ai-popup-layout, .tbdemo-ai-popup-container, .tbdemo-ai-propmts-empty-container, .tbdemo-ai-text-prompts, .tbdemo-ai-headline-prompts, .tbdemo-ai-propmts-result-container").hide();
}

function tbdemo_show_ai_popup( text ) {

  if ( text == '' ) {
     jQuery(".tbdemo-ai-description-input").val('').trigger("change");
     if( type === 'text' ) {
       jQuery(".tbdemo-ai-text-prompts").show();
     } else {
       jQuery(".tbdemo-ai-headline-prompts").show();
     }
     jQuery(".tbdemo-ai-propmts-result-container").hide();
     jQuery(".tbdemo-ai-popup-layout, .tbdemo-ai-popup-container, .tbdemo-ai-propmts-empty-container").show();
  }
  else {
     jQuery(".tbdemo-ai-result-textarea").val(text);
     jQuery(".tbdemo-ai-propmts-empty-container").hide();
     jQuery(".tbdemo-ai-popup-layout, .tbdemo-ai-popup-container, .tbdemo-ai-propmts-result-container").show();
  }
}

