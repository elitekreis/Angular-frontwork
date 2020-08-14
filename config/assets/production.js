'use strict';

module.exports = {
	client: {
		lib: {
			css: [
				//'public/lib/bootstrap/dist/css/bootstrap.min.css',
				//'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/angular-material/angular-material.min.css',
				'public/lib/nvd3/build/nv.d3.min.css',
				'public/lib/angular-material-data-table/dist/md-data-table.min.css'
				//'public/lib/ng-material-dropmenu/ng-material-dropmenu.min.css'
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-aria/angular-aria.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-material/angular-material.min.js',
				//'public/lib/ng-material-dropmenu/ng-material-dropmenu.min.js',
				'public/lib/angular-material-icons/angular-material-icons.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				//'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				// 'public/lib/angular-file-upload/angular-file-upload.min.js',
				'public/lib/angular-file-upload/angular-file-upload.min.js',
				'http://maps.google.com/maps/api/js?libraries=places',
				'public/lib/ngmap/build/scripts/ng-map.min.js',
				'public/lib/d3/d3.min.js',
				'public/lib/nvd3/build/nv.d3.min.js',
				'public/lib/angular-nvd3/dist/angular-nvd3.min.js',
				'public/lib/ng-lodash/build/ng-lodash.min.js',
				'public/lib/angular-material-data-table/dist/md-data-table.min.js',
				'public/lib/ng-infinite-scroll/ng-infinite-scroll.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	}
};
