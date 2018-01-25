/*
	Indivisible by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/

(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)',
		xxsmall: '(max-width: 360px)'
	});

	$(function() {

		var	$window = $(window),
			$document = $(document),
			$body = $('body'),
			$wrapper = $('#wrapper'),
			$footer = $('#footer');

		// Disable animations/transitions until the page has loaded.
			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading-0');

					window.setTimeout(function() {
						$body.removeClass('is-loading-1');
					}, 1500);
				}, 100);
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Panels.
			var $wrapper = $('#wrapper'),
				$panels = $wrapper.children('.panel'),
				locked = true;

			// Deactivate + hide all but the first panel.
				$panels.not($panels.first())
					.addClass('inactive')
					.hide();

			// Fix images.
				$panels.each(function() {

					var	$this = $(this),
						$image = $this.children('.image'),
						$img = $image.find('img'),
						position = $img.data('position');

					// Set background.
						$image.css('background-image', 'url(' + $img.attr('src') + ')');

					// Set position (if set).
						if (position)
							$image.css('background-position', position);

					// Hide original.
						$img.hide();

				});

			// Unlock after a delay.
				window.setTimeout(function() {
					locked = false;
				}, 1250);

			// Click event.
				$('a[href^="#"]').on('click', function(event) {

					var $this = $(this),
						id = $this.attr('href'),
						$panel = $(id),
						$ul = $this.parents('ul'),
						delay = 0;

					// Prevent default.
						event.preventDefault();
						event.stopPropagation();

					// Locked? Bail.
						if (locked)
							return;

					// Lock.
						locked = true;

					// Activate link.
						$this.addClass('active');

						if ($ul.hasClass('spinX')
						||	$ul.hasClass('spinY'))
							delay = 250;

					// Delay.
						window.setTimeout(function() {

							// Deactivate all panels.
								$panels.addClass('inactive');

							// Deactivate footer.
								$footer.addClass('inactive');

							// Delay.
								window.setTimeout(function() {

									// Hide all panels.
										$panels.hide();

									// Show target panel.
										$panel.show();

									// Reset scroll.
										$document.scrollTop(0);

									// Delay.
										window.setTimeout(function() {

											// Activate target panel.
												$panel.removeClass('inactive');

											// Deactivate link.
												$this.removeClass('active');

											// Unlock.
												locked = false;

											// IE: Refresh.
												$window.triggerHandler('--refresh');

											window.setTimeout(function() {

												// Activate footer.
													$footer.removeClass('inactive');

											}, 250);

										}, 100);

								}, 350);

						}, delay);

				});

		// IE: Fixes.
			if (skel.vars.IEVersion < 12) {

				// Layout fixes.
					$window.on('--refresh', function() {

						// Fix min-height/flexbox.
							$wrapper.css('height', 'auto');

							window.setTimeout(function() {

								var h = $wrapper.height(),
									wh = $window.height();

								if (h < wh)
									$wrapper.css('height', '100vh');

							}, 0);

						// Fix panel image/content heights (IE<10 only).
							if (skel.vars.IEVersion < 10) {

								var $panel = $('.panel').not('.inactive'),
									$image = $panel.find('.image'),
									$content = $panel.find('.content'),
									ih = $image.height(),
									ch = $content.height(),
									x = Math.max(ih, ch);

								$image.css('min-height', x + 'px');
								$content.css('min-height', x + 'px');

							}

					});

					$window.on('load', function() {
						$window.triggerHandler('--refresh');
					});

				// Remove spinX/spinY.
					$('.spinX').removeClass('spinX');
					$('.spinY').removeClass('spinY');

			}

	});

})(jQuery);