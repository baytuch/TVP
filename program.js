// TVP for Samsung Smart TV platform (4.5)

var Main = {                     // Main object
}

var widgetAPI = new Common.API.Widget();        // Creates Common module
var tvKey = new Common.API.TVKeyValue();

Main.onLoad = function(){             // called by body's onload event
    alert("Main.onLoad()");
    widgetAPI.sendReadyEvent();             // Sends ready message to Application Manager
    document.getElementById("anchor").focus();    // Sets focus on anchor for handling key inputs
                                                  // from the remote control
    /**
     * JavaScript code Here!
     */
    init_TVP();
}

Main.keyDown = function(){           // Key handler
    var keyCode = event.keyCode;
    alert("Main Key code : " + keyCode);

    switch (keyCode) {
        case tvKey.KEY_LEFT:
            alert("left");
            break;
        case tvKey.KEY_RIGHT:
            alert("right");
            break;
        case tvKey.KEY_UP:
            alert("up");
            processor('down');
            break;
        case tvKey.KEY_DOWN:
            alert("down");
            processor('up');
            break;
        case tvKey.KEY_ENTER:
            alert("enter");
            break;
        case tvKey.KEY_PLAY:
            alert("play");
            processor('play');
            break;
        case tvKey.KEY_STOP:
            alert("stop");
            processor('stop');
            break;
        case tvKey.KEY_BLUE:
            alert("KEY_BLUE");
            processor('en_full');
            break;
        case tvKey.KEY_RED:
            alert("KEY_RED");
            processor('ds_full');
            break;
        case tvKey.KEY_RETURN:
            break;
    }
}



// TVP

var api_domain = "http://vps.it-hobby.km.ua/TVP";
var service_video_dir = '';
var service_thumbs_dir = '';
var content_len = 0;
var mediafound = new Array();
mediafound['video'] = new Array();
mediafound['thumbs'] = new Array();
mediafound['service'] = new Array();

//Load content information section
function loadInfo(data){
  if (data.status == 'ok'){
    var n = 0;
    for(n in data.content){
      mediafound['video'][n] = data.content[n].video;
      mediafound['thumbs'][n] = data.content[n].thumb;
    };
    mediafound['service'][0] = data.status;
    mediafound['service'][1] = data.vdir;
    mediafound['service'][2] = data.thdir;
    mediafound['service'][3] = n;
    service_video_dir = mediafound['service'][1];
    service_thumbs_dir = mediafound['service'][2];
    content_len = mediafound['service'][3];
    alert('Info loaded: has ' + content_len + ' positions');
    processor('init');
  };
}

function init_TVP(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', api_domain + '/api.php', true);
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4){
      if(xmlhttp.status == 200){
    	alert('HTTP request API: OK');
    	loadInfo(JSON.parse(xmlhttp.responseText));
	  };
    };
  };
  xmlhttp.send(null);
}



// Processor code section

var offset_n = 0;
var focus_n = 0;
var pos_n = 0; 
var mode = 'stop';
var fullscreen_mode = false;
var textarr = new Array();
function processor(com){
  if (com == 'init'){
    alert('panel init');
    panel_draw('init');
    player_controller('init');
  };
  if (com == 'up'){
    alert('panel up');
    if (pos_n < content_len) pos_n++;
    if (pos_n > content_len) pos_n = content_len;
    mode = 'stop';
    alert(pos_n);
  };
  if (com == 'down'){
    alert('panel down');
    if (pos_n > 0) pos_n--;
    if (pos_n < 0) pos_n = 0;
    mode = 'stop';
    alert(pos_n);
  };
  if (com == 'play'){
    alert('init play');
    if (mode == 'stop'){
      mode = 'play';
      player_controller('play');
    }
  }
  if (com == 'stop'){
    alert('init stop');
    if (mode == 'play'){
      mode = 'stop';
      player_controller('stop');
    }
  }
  if (com == 'en_full'){
    alert('Enable fullscreen');
    if (!fullscreen_mode){
      fullscreen_mode = true;
      player_controller('en_full');
    }
  }
  if (com == 'ds_full'){
    alert('Disable fullscreen');
    if (fullscreen_mode){
      fullscreen_mode = false;
      player_controller('ds_full');
    }
  }
  if (pos_n <= 11){
    offset_n = 0;
    focus_n = pos_n;
    }else{
    offset_n = pos_n - 11;
    focus_n = 11;
  }
  panel_draw('draw');
  if (mode == 'stop'){
    player_controller('poster');
  }
}



// Video player section

var player_box_obj = null;
var player_obj = null;

function enableFullScreen(){
  player_box_obj.style.top = '0px';
  player_box_obj.style.left = '0px';
  player_box_obj.style.width = '958px';
  player_box_obj.style.height = '538px';
  player_obj.style.width = '958px';
  player_obj.style.height = '538px';
}

function disableFullScreen(){
  player_box_obj.style.top = '60px';
  player_box_obj.style.left = '413px';
  player_box_obj.style.width = '484px';
  player_box_obj.style.height = '274px';
  player_obj.style.width = '484px';
  player_obj.style.height = '274px';
}

function player_controller(com){
  if (com == 'init'){
	player_box_obj = document.getElementById('player_box');
	player_obj = player_box_obj.getElementsByTagName('video')[0];
    player_obj.setAttribute('poster', api_domain + '/images/NOTH.jpg');
    player_obj.addEventListener('canplay', function(){ player_obj.play(); }, true);
  }
  if (com == 'poster'){
	var poster_url = api_domain + '/' + service_thumbs_dir + '/' + mediafound['thumbs'][pos_n];
    player_obj.setAttribute('poster', poster_url);
  }
  if (com == 'play'){
    var video_url = api_domain + '/' + service_video_dir + '/' + mediafound['video'][pos_n];
    player_obj.setAttribute('src', video_url);
  }
  if (com == 'stop'){
    player_obj.pause();
    player_obj.setAttribute('src', '');
  }
  if (com == 'en_full'){
	enableFullScreen();
  }
  if (com == 'ds_full'){
    disableFullScreen();
  }
}



// Panel control section

function NameCorrector(name){
  name = name.replace(/.mp4/g, '');
  name = name.replace(/_/g, ' ');
  return name;
}

var panel_divs_obj = null;
var color_passive = '#888';
var color_hover = '#BCBCBC';
var color_active = '#CCE0EE';
function panel_draw(com){
  if (com == 'init'){
    panel_divs_obj = document.getElementById('list').getElementsByTagName('div'); 
  };
  if (com == 'draw'){
	for (var k = 0; k<12; k++){
      textarr[k] = mediafound['video'][k + offset_n];
	};
    for (var n = 0; n<12; n++){
  	  panel_divs_obj[n].innerHTML = NameCorrector(textarr[n]);
      if (n == focus_n){
        if (mode == 'play'){
          panel_divs_obj[n].style.backgroundColor = color_active;
        };
        if (mode == 'stop'){
          panel_divs_obj[n].style.backgroundColor = color_hover;
        };
        }else{
        panel_divs_obj[n].style.backgroundColor = color_passive;
      };
    };
  };
}