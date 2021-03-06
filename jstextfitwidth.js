(function($) {

	var hiddenLineCSS = {
		display: "inline-block",
		position : "absolute", 
		visibility : "hidden",
		height : "auto",
		width : "auto",
		"white-space" : "nowrap",
	};

	var visibleLineCSS = {
		display: "inline-block",
		"white-space" : "nowrap",
	};
	
	var recursiveSetFontWidth = function (targetWidth, textElement, currentFontSize, changedLastTime, increment, depth, acceptableError) {
		
		if (depth == 100)
			return;

		var width = textElement.outerWidth();
		if (changedLastTime) {
			increment = -increment / 2;
		}
		
		var before = width;
		textElement.css('font-size', "" + (currentFontSize + increment) + "px");

		if (Math.abs(textElement.outerWidth() - targetWidth) < acceptableError) {
			return;
		}
		
		var changed = (width < targetWidth) !== (textElement.outerWidth() < targetWidth);
		recursiveSetFontWidth(targetWidth, textElement, currentFontSize + increment, changed, increment, depth + 1, acceptableError);
	};

	$.fn.textfitwidth = function(options) {

		var settings = $.extend({
			delimiter : "\n",
			acceptableError : 0.1,
			CSSProperties : [],
		}, options );

		this.each(function() {
			var textBlock = $(this);
			var lines = textBlock.text().split(settings.delimiter);
			var blockWidth = textBlock.outerWidth();

			// Clear the text block
			textBlock.html('');

			// Create the test area for testing the length of lines
			var testarea = $('<div id="textfitwidth_testarea"></div>').appendTo("body");

			// Add all of the lines to the test area
			lines.forEach(function (line) {
				testarea.append('<div>' + line.trim() + '</div>');
			});

			// Apply the hidden line css to each new div within the test area
			testarea.children().css(hiddenLineCSS);
			
			// Transfer extra css property values
			var extraCSSProperties = {};
			settings.CSSProperties.forEach(function (property) {
				extraCSSProperties[property] = textBlock.css(property);
			});
			testarea.children().css(extraCSSProperties);

			// Recursively find the appropriate width of each line, then transfer them back to the original container
			testarea.children().each(function () {

				// Set initial size and find the desired size recursively
				$(this).css('font-size', 10);

				// Get the width of the text
				var width = $(this).outerWidth();

				var SizeToWidthRatio = 10 / width;
				var estimatedFinalSize = SizeToWidthRatio * blockWidth;

				recursiveSetFontWidth(blockWidth, $(this), estimatedFinalSize, width > blockWidth, 4, 0, settings.acceptableError);

				// Add to the original container
				textBlock.append('<div style="font-size: ' + $(this).css('font-size') + '">' + $(this).text() + '</div>');
				textBlock.last().css(visibleLineCSS);

			});

			// Remove the testarea
			testarea.remove();

		});

		return this;

	};

}(jQuery));
