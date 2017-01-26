'use strict';

const places =
	[{
		"name": "747",
		"res_id": "73002",
		"loc": {
			"lat": 12.9440736478,
			"lng": 80.2381680161
		}
	}, {
		"name": "Sigree Global Grill",
		"res_id": "68864",
		"loc": {
			"lat": 12.9304388889,
			"lng": 80.2318888889
		}
	}, {
		"name": "Aasife & Brothers Biriyani Centre",
		"res_id": "72449",
		"loc": {
			"lat": 12.9300000000,
			"lng": 80.2300000000
		}
	}, {
		"name": "Barbeque Nation",
		"res_id": "71405",
		"loc": {
			"lat": 12.9400000000,
			"lng": 80.2400000000
		}
	}, {
		"name": "Evoke Bistro - Bar & Grill",
		"res_id": "72578",
		"loc": {
			"lat": 12.9301860000,
			"lng": 80.2319510000
		}
	}, {
		"name": "Sangeetha Veg Restaurant",
		"res_id": "67226",
		"loc": {
			"lat": 12.9439416667,
			"lng": 80.2377166667
		}
	}, {
		"name": "Bhatinda Xpress",
		"res_id": "73252",
		"loc": {
			"lat": 12.9497173219,
			"lng": 80.2377251163
		}
	}, {
		"name": "Urban Desi House",
		"res_id": "72377",
		"loc": {
			"lat": 12.9502120000,
			"lng": 80.2375030000
		}
	}, {
		"name": "Mirchi Cuisine",
		"res_id": "66906",
		"loc": {
			"lat": 12.9455222222,
			"lng": 80.2393416667
		}
	}],
	//my_google_api_key = 'AIzaSyDtXlY4M3YIPARLv7l4nP1dHyU7iZEX3co',
	myZomatoKey = 'e1b364d49796cd5f6310b42290c41c18',
	zomatoUrl = 'https://developers.zomato.com/api/v2.1/restaurant?apikey=' + myZomatoKey + '&res_id=';
let contentString = '',
	infoWindow;
const formHtmlData = function (response) {
	if (!response) return '';
	const na = "NA",
		name = response.name || na,
		cuisines = response.cuisines || na,
		currency = response.currency || na,
		average_cost_for_two = response.average_cost_for_two || na,
		aggregate_rating = response.user_rating ? response.user_rating.aggregate_rating || na : na,
		rating_color = response.user_rating ? response.user_rating.rating_color || na : na;
	return '<h1>' + name + '</h1>' +
		'<div id="bodyContent">' +
		'<p><b>' + name + '</b> is famous for ' + cuisines + ' cuisines. The average cost for two people generally is ' + currency + ' ' + average_cost_for_two + '</p>' +
		'<p>Rating :  <strong style="color:#' + rating_color + '">' + aggregate_rating + '</strong></p>' +
		'</div>' +
		'</div>';
};

function getViewport() {

	var viewPortWidth;
	var viewPortHeight;

	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
	if (typeof window.innerWidth != 'undefined') {
		viewPortWidth = window.innerWidth,
			viewPortHeight = window.innerHeight
	}
	return {
		height: viewPortHeight,
		width: viewPortWidth
	}
}
const populateContentString = function (place, map, marker) {
	$.get(zomatoUrl + place.res_id)
		.done(function (response) {
			contentString = formHtmlData(response);
			infoWindow.setContent(contentString)
			infoWindow.close();
			infoWindow.open(map, marker);
		})
		.fail(function () {
			alert("error");
		});

};


const myLatLng = {
		lat: 12.947903,
		lng: 80.234203
	},
	menuIcon = $('.menu-icon-link');

let map = {},
	markers = [];
const setMapMarkers = function (placess) {
	if (!window.google) return '';
	markers = placess.map(function (place) {
		var marker = new google.maps.Marker({
			position: place.loc,
			map: map,
			icon: 'https://maps.google.com/mapfiles/ms/micons/snack_bar.png', //image,
			title: place.name
		});
		//KO observable to hot filtering
		marker.displayIcon = ko.observable(true);
		marker.addListener('click', function () {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function () {
				marker.setAnimation(null);
			}, 1400);
			populateContentString(place, map, marker);

		});
		return marker;
	});
};

menuIcon.on('click', function () {
	$('body').toggleClass('menu-hidden');
});

function NearByRestaurantsClass(data) {
	var self = this;
	self.error = ko.observable(false);
	self.errorMsg = ko.observable("");
	self.filtered_item = ko.observable('');
	//self.places = ko.observableArray(places);
	self.textClick = function (place) {
		google.maps.event.trigger(markers[markers.indexOf(place)], 'click');
		if (getViewport().width && getViewport().width < 750)
			$('body').toggleClass('menu-hidden');

	};



	self.places = ko.computed(function () {
		self.error(false);
		self.errorMsg("");
		//in case info window is open
		infoWindow?infoWindow.close():'';
		if (markers.length < 1) {
			//In case the markers somehow got reset
			setMapMarkers(places);
		} else {
			markers.forEach(x => {
				if (self.filtered_item() !== '') {
					if (x.title && x.title.toLowerCase().match(self.filtered_item().toLowerCase())) {
						x.setVisible(true);
						x.displayIcon(true)
					} else {
						x.setVisible(false);
						x.displayIcon(false)
					}
				} else {
					x.setVisible(true);
					x.displayIcon(true)
				};
			});
		}
		if (markers.filter(x => x.visible).length < 1) {
			self.error(true);
			self.errorMsg("Looks like there are no matching items with this name. Please try again with different name");
		}
		return markers;
	});
	if (!window.google) {
		self.error(true);
		self.errorMsg("Looks like something went wrong. Please try again");
	};
}

function initMap() {
	map = new google.maps.Map(document.getElementById('mapArea'), {
		zoom: 14,
		center: myLatLng
	});
	infoWindow = new google.maps.InfoWindow();
	setMapMarkers(places);
	ko.applyBindings(new NearByRestaurantsClass());
}

function errorHandler() {
	//alert('Something went wrong. Try again later. If the issue persists, try using a different browser');
	ko.applyBindings(new NearByRestaurantsClass());
}