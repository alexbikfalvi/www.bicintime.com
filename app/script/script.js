google.maps.visualRefresh = true;

var map = null;
var mapAutocomplete = null;
var mapGeocoder = null;
var mapDirections = null;
var mapMarkersEnds = [];
var mapMarkersStations = [];
var mapPaths = [];

var mapMarkerFlagRed;
var mapMarkerFlagGreen;
var mapMarkerFlagBlue;
var mapMarkerFlagCyan;
var mapMarkerFlagMagenta;
var mapMarkerBiciRed;
var mapMarkerBiciGreen;
var mapMarkerBiciBlue;
var mapMarkerBiciCyan;
var mapMarkerBiciMagenta;
var mapMarkerShadow;

var mapInfoWndOrigin;
var mapInfoWndDestination;
var mapInfoWndOriginStation;
var mapInfoWndDestinationStation;

var mapStylesGrayscale = [
  {
	stylers: [
	  { hue: "#000000" },
	  { saturation: -100 },
	  { lightness: 0 }
	]
  }
];
var mapStylesColor = [ { } ];

var strCurrentLocation = "Current location";

var isSearch = true;
var isNow = true;
var isIgnoreCollapsible = true;

var searchResult = null;

var pathOptionsWalkOrigin = {
	strokeColor: '#00FF00',
	strokeOpacity: 0.8,
	strokeWeight: 3
};
var pathOptionsBicing = {
	strokeColor: '#0000FF',
	strokeOpacity: 0.8,
	strokeWeight: 3
};
var pathOptionsWalkDestination = {
	strokeColor: '#FF0000',
	strokeOpacity: 0.8,
	strokeWeight: 3
};

$(document).ready(function(e) {
	var mapOptions = {
		center: new google.maps.LatLng(41.383333, 2.183333),
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		panControl: false,
		streetViewControl: false,
		zoomControl: false,
		styles: mapStylesGrayscale
	};
	// Create the map markers.
	mapMarkerFlagRed = { url:'images/PinFlatFlagRed_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerFlagGreen = { url:'images/PinFlatFlagGreen_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerFlagBlue = { url:'images/PinFlatFlagBlue_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerFlagCyan = { url:'images/PinFlatFlagCyan_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerFlagMagenta = { url:'images/PinFlatFlagMagenta_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerBiciRed = { url:'images/PinFlatBiciRed_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerBiciGreen = { url:'images/PinFlatBiciGreen_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerBiciBlue = { url:'images/PinFlatBiciBlue_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerBiciCyan = { url:'images/PinFlatBiciCyan_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerBiciMagenta = { url:'images/PinFlatBiciMagenta_50.png', size: google.maps.Size(50, 50), origin: google.maps.Point(0, 0), anchor: google.maps.Point(25, 45) };
	mapMarkerShadow = { url:'images/PinShadow_50.png', size: new google.maps.Size(34, 17), origin: new google.maps.Point(0,0), anchor: new google.maps.Point(2, 17) };
	// Create the information windows.
	mapInfoWndOrigin = new google.maps.InfoWindow();
	mapInfoWndDestination = new google.maps.InfoWindow();
	mapInfoWndOriginStation = new google.maps.InfoWindow();
	mapInfoWndDestinationStation = new google.maps.InfoWindow();
	// Create the map.
	map = new google.maps.Map($("#map-canvas")[0], mapOptions); 
	// Create the map autocomplete service.
	mapAutocomplete = new google.maps.places.AutocompleteService();
	// Create the map geocoder.
	mapGeocoder = new google.maps.Geocoder();
	// Create the map directions service.
	mapDirections = new google.maps.DirectionsService();
	// Open the search panel.
	$("#search-panel").panel("open");	
});

$(document).on("pageinit", "#main-page", function() {
	// Add an event handle for the menu panel swipe.
    $(document).on("swiperight", "#main-page", function(e) {
        if ($.mobile.activePage.jqmData("panel") !== "open") {
            if (e.type === "swiperight") {
                $("#menu-panel").panel("open");
            }
        }
    });
	// Add an event handler to the search navigation button.
	$("#navigation-search").on("click", function(e) {
		// Close the the about panel.
		$("#about-panel").panel("close");
		if (isSearch) {
			// Open the search panel.
			$("#search-panel").panel("open");
		}
		else {
			// Open the results panel.
			$("#results-panel").panel("open");
		}
	});
	// Add an event handler for the opening of the search panel.
	$("#search-panel").on("panelbeforeopen", function(e, data) {
		var date = new Date();
		// Reset the search date.
		$("#search-date-time").val(formatTime(date));
	});
	// Add an event handler for the changed event of the origin input.
	$("#search-origin").change(function(e) {
		onSearchInputChanged($(this), $("#search-origin-autocomplete"));
    });
	// Add an event handler for the changed event of the destination input.
	$("#search-destination").change(function(e) {
		onSearchInputChanged($(this), $("#search-destination-autocomplete"));
    });
	// Add an event handler for the focus in of the destination input.
	$("#search-origin").focusin(function(e) {
		// If the text is set to the current location, clear.
		if ($(this).val() == strCurrentLocation) {
			$(this).val("");
		}
    });
	// Add an event handler for the focus in of the destination input.
	$("#search-destination").focusin(function(e) {
		// If the text is set to the current location, clear.
		if ($(this).val() == strCurrentLocation) {
			$(this).val("");
		}
    });
	// Add an event handler for the origin autocomplete.
	$("#search-origin").keyup(function(e) {
		// Call the autocomplete method.
		onMapAutocomplete($(this), $("#search-origin-autocomplete"));
    });
	// Add an event handler for the destination autocomplete.
	$("#search-destination").keyup(function(e) {
		// Call the autocomplete method.
		onMapAutocomplete($(this), $("#search-destination-autocomplete"));
    });
	// Add event handlers for the time selection buttons.
	$("#search-date-time-now").on("click", function(e) {
		// Disable the date-time input.
		$("#search-date-time").textinput("disable");
		// Set the time flag.
		isNow = true;
	});
	$("#search-date-time-custom").on("click", function(e) {
		// Enable the date-time input.
		$("#search-date-time").textinput("enable");
		// Set the time flag.
		isNow = false;
	});
	// Prevent page reload on search form submission.
	$("#search-form").on("submit", function() { return false; })
	// Add an event handler for the search start button.
	$("#search-start").on("click", function(e) {
		// Start the search.
		onMapSearch();
    });
	// Add an event handler for the search cancel button.
	$("#search-cancel").on("click", function(e) {
		// Close the search panel.
		$("#search-panel").panel("close");
    });
	// Add the menu event handlers.
	$("#menu-planner").on("click", function(e) {
		// Close the the about panel.
		$("#about-panel").panel("close");
		if (isSearch) {
			// Open the search panel.
			$("#search-panel").panel("open");
		}
		else {
			// Open the results panel.
			$("#results-panel").panel("open");
		}
	});
	$("#menu-about").on("click", function(e) {
		// Open the about pannel.
		$("#about-panel").panel("open");
	});
	// For each result collapsible, create an event handler.
	$(document).bind("expand", ".result-collapsible", function () {
		// If ignoring the collapsible events, return.
		if (isIgnoreCollapsible) return;
		alert('Expanded');
	}).bind("collapse", ".result-collapsible", function () {
		// If ignoring the collapsible events, return.
		if (isIgnoreCollapsible) return;
		$(this).find("[class='.result-collapsible']").trigger("expand");
		alert('Collapsed');
//		var $collapse = $(this).find('[data-role="collapsible"]');
	});	
});

// An event handler called on the map place autocomplete.
function onMapAutocomplete(input, list) {
	var value = input.val();
	var html = "";
	if (value && value.length > 2) {
		mapAutocomplete.getQueryPredictions({ input: value }, function(predictions, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0, prediction; prediction = predictions[i]; i++) {
					html += '<li data-icon="false"><a class="search-autocomplete-select" href="#">' + prediction.description + '</a></li>';
				}
				// Show the search list.
				onShowSearchList(input, list, html);
				// Set an event handler for each autocomplete option.
				$(".search-autocomplete-select").click(function(e) {
					// When the option is selected, update the text.
					input.val($(this).text());
					// Hide the search list.
					onHideSearchList(list);
				});									
			}
		});
	}
	else {
		// Show the autocomplete list.
		onShowSearchList(input, list);
	}
	// Call the input changed.
	onSearchInputChanged(input, list);
}

// Shows the specified search list.
function onShowSearchList(input, list, items) {
	// Create the html.
	var html = '<li data-icon="gps"><a class="search-autocomplete-select-gps" href="#">' + strCurrentLocation + '</a></li>';
	if (items) {
		html = html + '<li data-role="list-divider">Suggestions</li>' + items;
	}
	// Update the list.
	list.html(html);
	list.listview("refresh");
	list.trigger("updatelayout");
	// Set an event handler for the current location option.
	$(".search-autocomplete-select-gps").click(function(e) {
		// When the option is selected, update the text.
		input.val(strCurrentLocation);
		// Hide the search list.
		onHideSearchList(list);
	});	
}

// Hides the specified search list.
function onHideSearchList(list) {
	list.html("");
	list.listview("refresh");
	list.trigger("updatelayout");
}

// An event handler called when a search input has changed.
function onSearchInputChanged(input, list) {
	// If the text is empty because the user selected the clear button.
	if (input.val() == "") {
		// Hide the list.
		onHideSearchList(list);
	}
	// Call the search changed method.
	onSearchChanged();
}

// An event handler called when the search has changed.
function onSearchChanged() {
	if (($("#search-origin").val().length > 0) && ($("#search-destination").val().length > 0)) {
		if ($("#search-start").hasClass("ui-disabled")) {
			$("#search-start").removeClass("ui-disabled");
			$("#search-start").button("refresh");
		}
	}
	else {
		if (!$("#search-start").hasClass("ui-disabled")) {
			$("#search-start").addClass("ui-disabled");
			$("#search-start").button("refresh");
		}
	}
}

// An event handler called when performing a search.
function onMapSearch() {
	// Get the origin address.
	var originAddr = $("#search-origin").val();
	// If the origin location is the current location.
	if (originAddr == strCurrentLocation) {
		if (navigator.geolocation) {
			// Call the search origin function with the current location.
			navigator.geolocation.getCurrentPosition(function(position) {
				onMapSearchOrigin(originAddr, new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, function() {
				alert("The current location is not available.");
			});
		}
		else {
			alert("The current location is not available.");
		}
	}
	else {
		// Use the geocoder service to get the origin location.
		mapGeocoder.geocode({'address': originAddr}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// Call the search origin function.
				onMapSearchOrigin(originAddr, results[0].geometry.location);
			} else {
				alert("Cannot find the origin address.");
			}
		});
	}
}

// An event handler called when receiving the response for the origin location.
function onMapSearchOrigin(originAddr, originLocation) {
	$.mobile.loading("show", {
		text: "",
		textVisible: false,
		theme: "f",
		textonly: false
	});
	// Get the destination address.
	var destinationAddr = $("#search-destination").val();
	// If the destination location is the current location.
	if (destinationAddr == strCurrentLocation) {
		if (navigator.geolocation) {
			// Call the search origin function with the current location.
			navigator.geolocation.getCurrentPosition(function(position) {
				onMapSearchDestination(
					originAddr,
					destinationAddr, 
					originLocation,
					new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
					);
			}, function() {
				$.mobile.loading("hide");
				alert("The current location is not available.");
			});
		}
		else {
			$.mobile.loading("hide");
			alert("The current location is not available.");
		}
	}
	else {
		// Use the geocoder service to get the destination location.
		mapGeocoder.geocode({'address': destinationAddr}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// Call the search destination function.
				onMapSearchDestination(
					originAddr,
					destinationAddr,
					originLocation,
					results[0].geometry.location
					);
			}
			else {
				$.mobile.loading("hide");
				alert("Cannot find the destination address.");
			}
		});
	}
}

// An event handler called when receiving the responde for the destination location.
function onMapSearchDestination(originAddr, destinationAddr, originLocation, destinationLocation) {
	// Close the search panel.
	$("#search-panel").panel("close");
	// Clear the map.
	clearMap();
	// Create a new origin marker.
	var markerOrigin = new google.maps.Marker({
		position: originLocation,
		icon: mapMarkerFlagGreen,
		shadow: mapMarkerShadow,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title:"Leave At"
	});
	// Create a new destination marker.
	var markerDestination = new google.maps.Marker({
		position: destinationLocation,
		icon: mapMarkerFlagRed,
		shadow: mapMarkerShadow,
		flat: false,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title:"Arrive At"
	});
	// Add the marker event handlers.
	google.maps.event.addListener(markerOrigin, 'click', function() {
		mapInfoWndOrigin.setOptions({content: '<div class="map-info-window"><h3>' + originAddr + '</h3></div>'});
		mapInfoWndOrigin.open(map, markerOrigin);
	});
	google.maps.event.addListener(markerDestination, 'click', function() {
		mapInfoWndDestination.setOptions({content: '<div class="map-info-window"><h3>' + destinationAddr + '</h3></div>'});
		mapInfoWndDestination.open(map, markerDestination);
	});
	// Add the map markers.
	mapMarkersEnds.push(markerOrigin);
	mapMarkersEnds.push(markerDestination);
	// Center the map on the markers.
	var mapBounds = new google.maps.LatLngBounds();
	for (var i = 0; i < mapMarkersEnds.length; i++) {
		mapBounds.extend(mapMarkersEnds[i].getPosition());
	}
	map.setCenter(mapBounds.getCenter());
	map.fitBounds(mapBounds);
	// Add the markers to the map.
	for (var i = 0; i < mapMarkersEnds.length; i++) {
		setTimeout(function(index) { mapMarkersEnds[index].setMap(map); }, 500 * i, i);
	}

	// Compute directions for the specified locations.
	onRequestDirections(originAddr, destinationAddr, originLocation, destinationLocation);	
}

// A method that request the directions for the given location.
function onRequestDirections(originAddr, destinationAddr, originLocation, destinationLocation) {
	// Get the selected time.
	var date = isNow ? new Date() : new Date($("#search-date-time").val());
	// Compute the request url.
	var url = 'http://bicing.h2o.net.br/getroute.php?origin=' +
		originLocation.lat() + ',' + originLocation.lng() + '&destination=' +
		destinationLocation.lat() + ',' + destinationLocation.lng() + '&time=' +
		date.getTime();
	// Ignore the collapsible events.
	isIgnoreCollapsible = true;
	// Request the directions.
	$.ajax(url, { timeout:60000 }).done(function(result) {
		// Save the result.
		searchResult = result;
		// Create the result html content.
		var html = '<div class="ui-panel-inner">';
		// Parse each result.
		$.each(result, function(index, value) {
			var timeWalkOrigin = Math.ceil(value.time.depToStation / 60);
			var timeBicing = Math.ceil(value.time.bicing / 60);
			var timeWalkDestination = Math.ceil(value.time.stationToDest / 60);
			// Create the results set.
			html += '<div data-role="collapsible-set" data-content-theme="f">' +
				'<div class=".result-collapsible" data-role="collapsible" data-mini="true" data-collapsed="' + (index == 0 ? "false" : "true") + '" style="font-size:80%">' +
				'<h3>' + formatDistance(value.distance.sum) + ' (' + value.print.sumTime + ')</h3>' +
				'<table border="0" cellspacing="0" cellpadding="0">' +
		        '<tr><td rowspan="1" valign="top"><img src="images/PinFlatFlagGreen_100.png" width="50" height="50" alt="Origin address" /></td>' + 
				'<td><b>Leave at</b><br/>' + originAddr + '</td></tr>' + 
		        '<tr><td rowspan="1" valign="top"><img src="images/PinFlatBiciGreen_100.png" width="50" height="50" alt="Origin station" /></td>' + 
				'<td><b>Get bike at (+' + timeWalkOrigin + ' min)</b><br/>' + value.station.start.street + ' ' + value.station.start.street_number +
				'<br/>Station: ' + value.station.start.station_id + '<br/>Bikes now: ' + value.station.start.bikes +
				'<br/>Bikes estimated: ' + value.station.start.estimation.bikes + '</td></tr>' + 
		        '<tr><td rowspan="1" valign="top"><img src="images/PinFlatBiciRed_100.png" width="50" height="50" alt="Destination station" /></td>' + 
				'<td><b>Leave bike at (+' + timeBicing + ' min)</b><br/>' + value.station.arrive.street + ' ' + value.station.arrive.street_number +
				'<br/>Station: ' + value.station.arrive.station_id + '<br/>Slots now: ' + value.station.arrive.slots +
				'<br/>Slots estimated: ' + value.station.arrive.estimation.slots + '</td></tr>' + 
		        '<tr><td rowspan="1" valign="top"><img src="images/PinFlatFlagRed_100.png" width="50" height="50" alt="Destination station" /></td>' + 
				'<td><b>Arrive at (+' + timeWalkDestination + ' min)</b><br/>' + destinationAddr + '</td></tr>' + 
				'</table></div></div>';
		});
		// Add the close button.
		html += '<a href="#" type="button" data-theme="a" id="results-clear">New search</a></div>';
		// Set the html result.
		$("#results-panel").html(html);
		$("#results-panel").trigger("create");
		// Close the search panel.
		$("#search-panel").panel("close");
		// Open the results panel.
		$("#results-panel").panel("open");
		// Set the search flag to false.
		isSearch = false;
		// Add an event handler for the results clear button.
		$("#results-clear").on("click", function(e) {
			// Close the results panel.
			$("#results-panel").panel("close");
			// Open the search panel.
			$("#search-panel").panel("open");
			// Clear the map.
			clearMap();
			// Change the map style to grayscale.
			map.setOptions({styles: mapStylesGrayscale});
			// Set the search flag to true.
			isSearch = true;
		});
		// If the result is not empty.
		if (searchResult.length > 0) {
			// Show the route for the first result.
			onDisplayStations(0, originLocation, destinationLocation);
		}
		else {
			// Hide the loading icon.
			$.mobile.loading("hide");
		}
		// Allow collapsible.
		isIgnoreCollapsible = false;
	}).fail(function(result) {
		// Hide the loading icon.
		$.mobile.loading("hide");
		alert("The server request timed out." + JSON.stringify(result));
	});
}

// A method called to display the bicing stations.
function onDisplayStations(index, originLocation, destinationLocation) {
	// Clear the map directions.
	clearMapDirections();
	
	// Get the current result.
	var result = searchResult[index];
	
	// Create the origin station location.
	var originStation = new google.maps.LatLng(result.station.start.latitude, result.station.start.longitude);
	// Create the destination station location.
	var destinationStation = new google.maps.LatLng(result.station.arrive.latitude, result.station.arrive.longitude); 
	
	// Create a new origin station marker.
	var markerOrigin = new google.maps.Marker({
		position: originStation,
		icon: mapMarkerBiciGreen,
		shadow: mapMarkerShadow,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title:"Get Bike At"
	});
	// Create a new destination marker.
	var markerDestination = new google.maps.Marker({
		position: destinationStation,
		icon: mapMarkerBiciRed,
		shadow: mapMarkerShadow,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title:"Leave Bike At"
	});
	
	// Change the map style to color.
	map.setOptions({styles: mapStylesColor});

	// Add the markers event handler.
	google.maps.event.addListener(markerOrigin, 'click', function() {
		var infoWnd = new google.maps.InfoWindow({
			content: '<div><h3>Origin bicing station</h3><p><b>Station: </b>' + result.station.start.station_id + '</p>' +
				'<p><b>Address: </b>' + result.station.start.street + ' ' + result.station.start.street_number + '</p>' +
				'<p><b>Bikes now: </b>' + result.station.start.bikes + '</p>' +
				'<p><b>Bikes estimates: </b>' + result.station.start.estimation.bikes + '</p>' +
				'</div>'
		});
		infoWnd.open(map, markerOrigin);
	});
	google.maps.event.addListener(markerDestination, 'click', function() {
		var infoWnd = new google.maps.InfoWindow({
			content: '<div><h3>Destination bicing station</h3><p><b>Station: </b>' + result.station.arrive.station_id + '</p>' +
				'<p><b>Address: </b>' + result.station.arrive.street + ' ' + result.station.arrive.street_number + '</p>' +
				'<p><b>Slots now: </b>' + result.station.arrive.slots + '</p>' +
				'<p><b>Slots estimates: </b>' + result.station.arrive.estimation.slots + '</p>' +
				'</div>'
		});
		infoWnd.open(map, markerDestination);
	});
	
	// Add the map markers.
	mapMarkersStations.push(markerOrigin);
	mapMarkersStations.push(markerDestination);
	// Add the markers to the map.
	for (var i = 0; i < mapMarkersStations.length; i++) {
		setTimeout(function(index) { mapMarkersStations[index].setMap(map); }, 500 * i, i);
	}
	
	// Draw the directions.
	onDisplayDirections(originLocation, destinationLocation, originStation, destinationStation);
}

// A method that displays the directions for the specified points.
function onDisplayDirections(originLocation, destinationLocation, originStation, destinationStation) {
	// Route the origin walking.
	mapDirections.route(
		{origin:originLocation, destination:originStation, travelMode: google.maps.DirectionsTravelMode.WALKING },
		function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				// Set the map directions.
				addDirectionsPath(response, pathOptionsWalkOrigin);
			}
			else {
				// Hide the loading icon.
				$.mobile.loading("hide");
				alert("No directions could be found.");
			}
		});
	// Route the cycling.
	mapDirections.route(
		{origin:originStation, destination:destinationStation, travelMode: google.maps.DirectionsTravelMode.BICYCLING },
		function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				// Set the map directions.
				addDirectionsPath(response, pathOptionsBicing);
			}
			else {
				// Route using walking directions.
				mapDirections.route(
					{origin:originStation, destination:destinationStation, travelMode: google.maps.DirectionsTravelMode.WALKING },
					function(response, status) {
						if (status == google.maps.DirectionsStatus.OK) {
							// Set the map directions.
							addDirectionsPath(response, pathOptionsBicing);
						}
						else {
							// Hide the loading icon.
							$.mobile.loading("hide");
							alert("No directions could be found.");
						}
					});
			}
		});
	// Route the destination walking.
	mapDirections.route(
		{origin:destinationStation, destination:destinationLocation, travelMode: google.maps.DirectionsTravelMode.WALKING },
		function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				// Set the map directions.
				addDirectionsPath(response, pathOptionsWalkDestination);
			}
			else {
				// Hide the loading icon.
				$.mobile.loading("hide");
				alert("No directions could be found.");
			}
		});
}

// A function that adds the first route from a directions response as path.
function addDirectionsPath(response, opt) {
	// If there is no route, return null.
	if (response.routes.length == 0) {
		return null;
	}
	
	// Get the first route.
	var route = response.routes[0];
	
	// Create the array of coordinates.
	var coordinates = [];
	$.each(route.legs, function(i, leg) {
		$.each(leg.steps, function(j, step) {
			coordinates.push(step.start_location);
			coordinates.push(step.end_location);
		});
	});
	// Create the path.
	var path = new google.maps.Polyline({
		path: coordinates,
		geodesic: true
	});
	// Set the options.
	path.setOptions(opt);
	// Add the path to the map.
	mapPaths.push(path);
	path.setMap(map);
	// Hide the loading icon.
	$.mobile.loading("hide");
}

// Clears all markers and paths from the map.
function clearMap() {
	// Clear the endpoint markers.
	for (var i = 0; i < mapMarkersEnds.length; i++) {
		mapMarkersEnds[i].setMap(null);
	}
	mapMarkersEnds = [];
	// Clear the map directions.
	clearMapDirections();
}

// Clears the map directions.
function clearMapDirections() {
	// Clear the stations markers.
	for (var i = 0; i < mapMarkersStations.length; i++) {
		mapMarkersStations[i].setMap(null);
	}
	mapMarkersStations = [];
	// Clear the directions paths.
	for (var i = 0; i < mapPaths.length; i++) {
		mapPaths[i].setMap(null);
	}
	mapPaths = [];
}

// Formats the specified time for the date-time control.
function formatTime(time) {
	var dd = time.getDate();
	var mm = time.getMonth()+1;
	var yyyy = time.getFullYear();
	var hh = time.getHours();
	var MM = time.getMinutes();
	var ss = time.getSeconds();
	if(dd<10){dd='0'+dd;}
	if(mm<10){mm='0'+mm;}
	if(hh<10){hh='0'+hh;}
	if(MM<10){MM='0'+MM;}
	if(ss<10){ss='0'+ss;}
	
	return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + MM + ":" + ss;
}

// Formats the specified distance
function formatDistance(distance) {
	if (distance < 1000) return distance + " meters";
	else if (distance < 100000) return Math.floor(distance / 1000) + '.' + Math.round((distance % 1000) / 100) + " km";
	else return Math.round(distance / 1000) + " km";
}