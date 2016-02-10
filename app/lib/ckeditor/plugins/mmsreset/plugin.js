/**
 * Plugin for resetting cross reference elements into the CKEditor editing area.
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'mmsreset', {
	// Register the icons.
	icons: 'mmsreset',

	init: function( editor ) {
		editor.addCommand( 'resetCF', {
      exec: function( editor ) {
        var defaultConfig = {
          callbackModalFnc : function () {
            console.log("There is no callback function defined");
          }
        }
        var config = CKEDITOR.tools.extend(defaultConfig, editor.config.mmsreset || {}, true);
        var body = editor.getData();
        config.callback.resetFnc(body,'mms-transclude-name', '.name]');
        // config.callback.resetFnc(body.find('mms-transclude-doc'), '.doc]');
        // config.callback.resetFnc(body.find('mms-transclude-val'), '.val]');
        // config.callback.resetFnc(body.find('mms-view-link'), '.vlink]');
        editor.save();
        config.callback.update();
      }
    });
      
    editor.ui.addButton( 'mmsreset', {
        label: 'Update Cross Reference',
        command: 'resetCF',
    });
	}
});
