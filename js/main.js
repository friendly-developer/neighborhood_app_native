
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
let contentString = '',Infowindow;
const formHtmlData = function (response) {
	if (!response) return '';
	const na="NA",
	name = response.name||na,
	cuisines = response.cuisines||na,
	currency = response.currency||na,
	average_cost_for_two=response.average_cost_for_two||na,
	aggregate_rating=response.user_rating?response.user_rating.aggregate_rating||na:na,
	rating_color = response.user_rating?response.user_rating.rating_color||na:na;
	return '<h1>' + name + '</h1>' +
		'<div id="bodyContent">' +
		'<p><b>' + name + '</b> is famous for ' + cuisines + ' cuisines. The average cost for two people generally is ' + currency + ' ' + average_cost_for_two + '</p>' +
		'<p>Rating :  <strong style="color:#' + rating_color + '">' + aggregate_rating + '</strong></p>' +
		'</div>' +
		'</div>';
};

const populateContentString = function (place, map, marker) {
	$.get(zomatoUrl + place.res_id)
		.done(function (response) {
			contentString = formHtmlData(response);
			Infowindow.setContent(contentString)
			Infowindow.close();
			Infowindow.open(map, marker);
		})
		.fail(function () {
			alert("error");
		});

};


const myLatLng = {
	lat: 12.947903,
	lng: 80.234203
};

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



function NearByRestaurantsClass(data) {
	var self = this;
	self.filtered_item = ko.observable('');
	//self.places = ko.observableArray(places);
	self.textClick = function (place) {
		markers.forEach(x=>{
			if(x.title===place.name)
				google.maps.event.trigger(x, 'click');
		})
	};
	self.places = ko.computed(function () {
		let markersArr = [];
		markers.forEach(x => x.setMap(null));
		markers = [];
		if ((self.filtered_item() !== '')) {
			markersArr = places.filter(function (place) {
				return place.name.toLowerCase().match(self.filtered_item().toLowerCase());
			});
		} else {
			markersArr = places;
		}
		setMapMarkers(markersArr);
		console.log('markersArr', markersArr);
		console.log('markers', markers);
		return markersArr;
	});
}

function initMap() {
	map = new google.maps.Map(document.getElementById('mapArea'), {
		zoom: 14,
		center: myLatLng
	});
	Infowindow = 	new google.maps.InfoWindow();
	setMapMarkers(places);
	ko.applyBindings(new NearByRestaurantsClass());
}
function errorHandler(){
	alert('Something went wrong. Try again later. If the issue persists, try using a different browser')
}