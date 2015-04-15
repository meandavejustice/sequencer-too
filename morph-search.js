var columns = [].slice.call(document.querySelectorAll('.dummy-column'));
var morphSearch = document.getElementById( 'morphsearch' );
var input = morphSearch.querySelector( 'input.morphsearch-input' );
var ctrlClose = morphSearch.querySelector( 'span.morphsearch-close' );
var isOpen = false;

module.exports = function(emitter) {

  function toggleSearch(ev) {
    if( ev.type.toLowerCase() === 'focus' && isOpen ) return false;

	  if( isOpen ) {
      morphSearch.classList.remove('open');

		  // trick to hide input text once the search overlay closes
		  // todo: hardcoded times, should be done after transition ends
		  if( input.value !== '' ) {
			  setTimeout(function() {
          morphSearch.classList.add('hideInput');
				  setTimeout(function() {
            morphSearch.classList.remove('hideInput');
					  input.value = '';
				  }, 300 );
			  }, 500);
		  }
		  input.blur();
	  }
	  else {
      morphSearch.classList.add('open');
	  }
	  isOpen = !isOpen;
  }

  input.addEventListener( 'focus', toggleSearch );
  ctrlClose.addEventListener( 'click', toggleSearch );

  document.addEventListener( 'keydown', function( ev ) {
	  var keyCode = ev.keyCode || ev.which;
	  if( keyCode === 27 && isOpen ) {
		  toggleSearch(ev);
	  }
  });

  var curColumn = -1;
  var queryInput = document.querySelector('.query');

  document.querySelector('button[type="submit"]').addEventListener('click', search);

  function getCurColumn() {
    if (curColumn < 2) ++curColumn;
    else curColumn = 0;
    return curColumn;
  }

  function search(ev) {
    ev.preventDefault();
    [].slice.call(document.querySelectorAll('.track')).forEach(function(t) {
      t.remove();
    });

    req(initQuery(queryInput.value), function(response) {
      response.results.forEach(function(obj) {
        req(getSoundUrl(obj.id), function(soundResponse) {
          columns[getCurColumn()].appendChild(getTrackEl(soundResponse));
        });
      })
    });
  }

  function req(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onloadend = function(ev) {
      var response = JSON.parse(ev.target.response);
      cb(response);
    }
    xhr.send();
  }

  function initQuery(query) {
    return 'http://www.freesound.org/apiv2/search/text/?query=' + query +'&token=' + 'be7968b3d4f7468a896af568f214eed2b15948d2';
  }

  function getSoundUrl(id) {
    return 'http://www.freesound.org/apiv2/sounds/' + id +'?token=' + 'be7968b3d4f7468a896af568f214eed2b15948d2';
  }

  function getTrackEl(track) {
    var p = document.createElement('p');
    p.className = 'dummy-media-object track';
    p.setAttribute('url', track.previews['preview-lq-mp3']);
    var img = document.createElement('img');
    img.className = 'round';
    img.src = track.images.waveform_m;
    var h3 = document.createElement('h3');
    h3.innerText = track.name;
    p.appendChild(img);
    p.appendChild(h3);
    p.addEventListener('click', selectTrack)
    return p;
  }

  function selectTrack(ev) {
    var url = ev.target.getAttribute('url');
    if (!url) url = ev.target.parentElement.getAttribute('url');
    emitter.emit('track:add', {
      url: url
    });
    toggleSearch(ev);
  }

  morphSearch.querySelector( 'button[type="submit"]' ).addEventListener( 'click', function(ev) { ev.preventDefault(); } );
}