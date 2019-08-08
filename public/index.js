// This resizes the grid when the window is resized; 
resizeGrid();
window.addEventListener("resize", resizeGrid); 


// listen for MusicKit Loaded callback
document.addEventListener('musickitloaded', () => {
    console.log("musickit loaded :D")
    // MusicKit global is now defined --old-- /token
    fetch('/.netlify/functions/token-hider').then(response => response.json()).then(res => {
        console.log("res",res);
    /***
        Configure our MusicKit instance with the signed token from server, returns a configured MusicKit Instance
        https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance
    ***/
        const music = MusicKit.configure({
            developerToken: res.token,
            app: {
                name: 'AppleMusicCS115',
                build: '1978.4.1'
            },
            declarativeMarkup: true
        });
    

        //Constants for view switches
        var PLAYLIST_TAB = 0;
        var FORYOU_TAB = 1;
        var ALBUMS_TAB = 2;
        var SONGS_TAB = 3;
        var QUEUE_LIST = 4;
        var INSIDE_DISPLAY = 5; //might be unused
        var PLAYLIST_HELPER = 6;
        
        // display "for you" on musickit load
        hideLists();
        displayList(FORYOU_TAB);

        /***
         * https://developer.apple.com/documentation/musickitjs/musickit/events
         * event listener example
         */
        music.addEventListener('metadataDidChange', function(event){
           // console.log("musickit event test- metadataDidChange");
            var image = document.getElementById("art-display");
                //console.log("is playing-- changing art");
                // music.play(); 
                var temp1 = music.player.nowPlayingItem.artworkURL;
                if (temp1 != undefined)
                    image.src= temp1;
                else
                    image.src= "https://i.imgur.com/9x96RH6.png";
                //console.log(temp1);
                var temp2 = music.player.nowPlayingItem.attributes.name;
                document.getElementById("npName").textContent= temp2;
                var temp3 = music.player.nowPlayingItem.attributes.artistName;
                document.getElementById("npArtist").textContent= temp3
                var temp4 = music.player.nowPlayingItem.attributes.albumName;
                document.getElementById("npAlbum").textContent= temp4;
        });

        var isPlaying = false;
        document.getElementById('playpause-btn').addEventListener('click', () => {
            console.log("test");
            /***
            Resume or start playback of media item
            https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992709-play
            ***/
            if (!isPlaying) {
                music.play();
                isPlaying = true;
            }
            else{
                music.pause();
                isPlaying = false;
            }
        });

        document.getElementById('next-trk-btn').addEventListener('click', () => {
            /***
             * Skip to next item in queue.
             * https://developer.apple.com/documentation/musickitjs/musickit/player/2992772-skiptonextitem
             */
            music.skipToNextItem();
            

        });

        document.getElementById('prev-trk-btn').addEventListener('click', () => {
            /***
             * https://developer.apple.com/documentation/musickitjs/musickit/player/2992773-skiptopreviousitem
             */
            music.skipToPreviousItem();
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            var sMode = music.player.shuffleMode;
            var buttonElem = document.getElementById('shuffle-btn');
            //console.log("shuffle mode b4 click:", sMode);
            //i take care of checking for shuffle in updateInfo func
            if(sMode == 0){
                //do this - make shuffle
                music.player.shuffle = 1;
                buttonElem.style.backgroundColor = "#f57b42";
            }
            else{
                //mode set to 1
                //do this - make it not shuffle
                music.player.shuffle = 0;
                buttonElem.style.backgroundColor = "none";
                buttonElem.style.background = "transparent";
            }
            //console.log("shuffle mode after click:", music.player.shuffleMode);
        });

        document.getElementById('replay-btn').addEventListener('click', () => {

            music.player.seekToTime(0.0);

        });


        document.getElementById('login-btn').addEventListener('click', () => {
        /***
            Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
            https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992701-authorize
        ***/
            logButton = document.getElementById("login-btn");
            logging(logButton);
            // music.authorize().then(musicUserToken => {
            //   console.log(`Authorized, music-user-token: ${musicUserToken}`);
            // });
        });
        
        /** logging function  */
        function logging(logBtn){
            if(music.isAuthorized){
                music.unauthorize().then(musicUserToken => {
                    console.log(`Unauthorized, music-user-token: ${musicUserToken}`);
                    logBtn.innerHTML = "Login to Apple Music";
                });
            }
            else{
                music.authorize().then(musicUserToken => {
                    console.log(`Authorized, music-user-token: ${musicUserToken}`);
                    logBtn.innerHTML = "Logout";
                });
            }
        }
        


        document.getElementById("mySearch").addEventListener("search", mySearch);
        function mySearch(){
            //parse search term
            var term = document.getElementById("mySearch").value;
            var search_term = (term.split(" ")).join("+");
            //clear table view
            document.getElementById('split-view-id').style.display = "none";//hide splitscreen view
            var table = document.getElementById("song-table-right"); 
            for(var i = table.rows.length - 1; i > 0; i--)
            {
                table.deleteRow(i);
            }
            console.log("term "+search_term );


            //$(modal).find('.modal-title').text('Search results for "' + search_term + '"');
            //modal.title.textContent('Search results for "' + search_term + '"');
            modal.style.display = "block";
            var modal_title = document.getElementById("modal-title");
            //document.getElementById("myModal").title = 'Search results for "' + search_term + '"';
            document.getElementById("modal-title").innerHTML = 'Search results for "' + term + '"';
            modal_title.style.display = "block";
            document.getElementById("play-all-button").style.display = "none"; 
            //$('#modal-title').html('Search results for "' + search_term + '"');

            var call = music.api.search(search_term, {limit: 100, offset: 0, types: "songs"});
            deleteSongsOnTable("song-table-right"); 
            call.then(results => {
                showSongsOnTable("song-table-right", results.songs.data);
            });
        }

        function hideLists(){
            document.getElementById('table-div').style.display = 'none';
            document.getElementById('split-view-id').style.display = 'none'; 
            document.getElementById('grey-view-id').style.display = 'none';
            $("ol").empty();
        }

        // Reminder: Constants for view switches
        // PLAYLIST_TAB = 0;
        // FORYOU_TAB = 1;
        // ALBUMS_TAB = 2;
        // SONGS_TAB = 3;
        // QUEUE_LIST = 4;
        // INSIDE_DISPLAY = 5; 
        // PLAYLIST_HELPER = 6;

        //Nav bar button handlers
        document.getElementById('PlaylistsTab').addEventListener('click', () => {
            //create click event for item inside list and bring to list of playlist songs
            var type = PLAYLIST_TAB; 
            hideLists(); 
            displayList(type);
        });

        document.getElementById('ForYouTab').addEventListener('click', () => {
          
            var type = FORYOU_TAB; 
            hideLists(); 
            displayList(type);

        });
        document.getElementById('AlbumsTab').addEventListener('click', () => {
          
            var type = ALBUMS_TAB; 
            hideLists(); 
            displayList(type);

        });
        document.getElementById('SongsTab').addEventListener('click', () => {
          
            var type = SONGS_TAB; 
            hideLists();
            displayList(type);

        });

        document.getElementById('q-list-btn').addEventListener('click', () => {
          
            var type = QUEUE_LIST; 
            displayList(type);

        });

        document.getElementById('header-title').addEventListener('click', () => {
            //create click event for item inside list and bring to list of playlist songs
            var type = PLAYLIST_HELPER ; //6 is for homepage view
            hideLists(); 
            displayList(type);
        });

        //function to help display list
        function displayList(type,id){
            document.getElementById('page-title').innerHTML = "Playlists";
            listObj = document.getElementById("list")
            // listObj = document.getElementById("list")
            listPlaylist = document.getElementById("listPlaylist");//list on left of splitview
            if(type == PLAYLIST_TAB){ //display list of playlists
                $("ol").empty();
                var table = document.getElementById('song-table');
                for (var i = table.rows.length - 1; i > 0; i--)
                    table.deleteRow(i);
                //show split list view
                document.getElementById('split-view-id').style.display = "grid";

                music.api.library.playlists().then(playlists => {
                    var objList = playlists; //get user playlists
                    for(var i = 0; i < objList.length; i++){
                        var obj = objList[i];
                  
                        //added code -- below adds items to a actual list -- gotta make it clickable - stuck as fuck :P
                        var node = document.createElement("LI"); 
                        var textnode = document.createTextNode(obj.attributes.name);
                        node.appendChild(textnode);
                        console.log("ordered list value:",node.value);
                        node.setAttribute("data-id", obj.id);//sets the actual id (obj id) of the song to attribute (data-id) in the ACTUAL list
                        node.setAttribute("data-type", obj.type);
                        node.setAttribute("play-type", obj.attributes.playParams.kind); 
                        listPlaylist.appendChild(node); //append node
                        //i tried appending objects to the list but that did not work
                        // may have to make a "hash table" using a an array. first item of list is index 0 of array. lookup in array and get id of that song when song is clicked in list?
                    }
                });
            }

            // Removing "Artists" tab, replacing with "For You" page.
            else if(type == FORYOU_TAB){
                document.getElementById('page-title').innerHTML = "For You";
                document.getElementById('split-view-id').style.display = "none";//hide splitscreen view
                document.getElementById('grey-view-id').style.display = '';
                // console.log("for you clicked");
                //still to do... figure out replace in js so url is formated correctly, then work on looping through all
                //we just need the id  type and artwork for the "recommend item"
                var coverflowContainer = document.getElementById('coverflow-container-id');

                $('.cover').remove();

                music.api.recommendations().then( rec => {
                    // at the moment it just grabs one item 
                    var objList = rec;
                    // console.log("root",objList);
                    for(var i = 0; i< objList.length; i++){
                    //outside
                    // console.log("outer:",i);
                        for(var j = 0; j < objList[i].relationships.contents.data.length && j < 5; j++){// limit 
                            // console.log("inner:", j);
                            //inside loop -- [7].relationships.contents.data[8].attributes.playParams
                            // [1].relationships.contents.data[9].attributes.playParams.id / .kind
                            var ID = objList[i].relationships.contents.data[j].attributes.playParams.id;
                            var type = objList[i].relationships.contents.data[j].type//attributes.playParams.kind;
                            // demo link: https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/91/4e/e0/914ee0c7-a957-9854-d89f-b76bdbb366b9/11616.jpg/400x400bb.jpeg
                            var artURLString = objList[i].relationships.contents.data[j].attributes.artwork.url;
                            console.log("String before change",artURLString);
                            artURLString = artURLString.replace("{w}","100");// have to use regular expression because {} are special characters... already tried multiple ways with no luck
                            artURLString = artURLString.replace("{h}","100")
                            console.log("String after change", artURLString);
                            console.log("got to inner",ID,type);
                            var div = document.createElement('div');
                            div.setAttribute('class','cover');
                            div.textContent = objList[i].relationships.contents.data[j].attributes.name;
                
                            var img = document.createElement('img');
                            img.setAttribute('src',artURLString);//artwork
                            div.appendChild(img);
                            div.setAttribute('data-id',ID);
                            div.setAttribute('data-type',type);
                            coverflowContainer.appendChild(div);
                        }
                    }
                });

            }
            else if(type == ALBUMS_TAB){ //display list of albums
                document.getElementById('page-title').innerHTML = "Albums";
                $("ol").empty();
                var table = document.getElementById('song-table');
                for (var i = table.rows.length - 1; i > 0; i--)
                    table.deleteRow(i);
                //show split list view
                document.getElementById('split-view-id').style.display = "grid";
                counter = 0; 
                while(counter < 100){
                    music.api.library.albums(null,{limit:100, offset: counter * 100}).then(albums => {
                        for(var i = 0; i < albums.length; i++){
                            var obj = albums[i];
                      
                            //added code -- below adds items to a actual list -- gotta make it clickable - stuck as fuck :P
                            var node = document.createElement("LI"); 
                            var textnode = document.createTextNode(obj.attributes.name);
                            node.appendChild(textnode);
                            // console.log("ordered list value:",node.value);
                            node.setAttribute("data-id", obj.id);//sets the actual id (obj id) of the song to attribute (data-id) in the ACTUAL list
                            node.setAttribute("data-type", obj.type);
                            node.setAttribute("play-type", obj.attributes.playParams.kind); 
                            listPlaylist.appendChild(node); //append node
                        }
                    });
                    counter++; 
                }
            }   
            else if(type == SONGS_TAB){ //display list of songs
                document.getElementById('page-title').innerHTML = "Songs";
                document.getElementById('table-div').style.display = '';
                var table = document.getElementById("song-table"); 
                for(var i = table.rows.length - 1; i > 0; i--){
                    table.deleteRow(i);
                }
                var running = true;
                var counter = 0; 
                table.rowspan = 100000;
                deleteSongsOnTable("song-table"); 
                while(counter < 100){
                    var A = music.api.library.songs(null, {limit: 100, offset: counter * 100})
                    A.then(songs => {
                        showSongsOnTable("song-table", songs); 
                    });
                    counter++; 
                }
            }

            else if(type == QUEUE_LIST){
                document.getElementById('page-title').innerHTML = "Queue";
                document.getElementById('split-view-id').style.display = "none";//hide splitscreen view
                var running = true;
                var counter = 0;
                $("ol").empty();
                var objList = music.player._queue._items;
                
                deleteSongsOnTable("song-table-right"); 
                showSongsOnTable("song-table-right", objList); 
                document.getElementById("myModal").style.display = "block"; 
                document.getElementById("modal-title").innerHTML = "Songs in queue"; 
                document.getElementById("modal-title").style.display = "block"; 
            }
            else if (type == INSIDE_DISPLAY) {
                console.log("inside display func", id);
                //add hiding of other elements: song table and list

                var table = document.getElementById('song-table-right');
                deleteSongsOnTable("song-table-right"); 

                var A = music.api.library.playlistRelationship(id);
                A.then(songs => {
                    showSongsOnTable("song-table-right", songs); 
                });
            }
            else if (type == PLAYLIST_HELPER ) {
                $("ol").empty();
                var table = document.getElementById('song-table-right');
                document.getElementById('page-title').innerHTML = "Recently Played";
                for (var i = table.rows.length - 1; i > 0; i--)
                    table.deleteRow(i);
                //show split list view
                document.getElementById('split-view-id').style.display = "grid";

                music.api.recentPlayed(10).then(recentPlayed => {
                    var objList = recentPlayed; //get user playlists
                    for(var i = 0; i < objList.length; i++){
                        var obj = objList[i];

                        //added code -- below adds items to a actual list -- gotta make it clickable - stuck as fuck :P
                        var node = document.createElement("LI"); 
                        var textnode = document.createTextNode(obj.attributes.name);
                        node.appendChild(textnode);
                        console.log("ordered list value:",node.value);
                        node.setAttribute("data-id", obj.id);//sets the actual id (obj id) of the song to attribute (data-id) in the ACTUAL list
                        node.setAttribute("data-type", obj.type);
                        node.setAttribute("play-type", obj.attributes.playParams.kind); 
                        listPlaylist.appendChild(node); //first item of list is index 0 of array. lookup in array and get id of that song when song is clicked in list?
                    }
                });

            }
        }

        // define modal
        var modal = document.getElementById("myModal");

        // Get the button that opens the modal
        var btn = document.getElementById("listPlaylist");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on the button, open the modal 
        btn.onclick = function() {
            modal.style.display = "block";
            document.getElementById("play-all-button").style.display = "";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            document.getElementById("mySearch").value="";
            modal.style.display = "none";
            document.getElementById("play-all-button").style.display = "none";
            document.getElementById("modal-title").style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                document.getElementById("mySearch").value="";
                modal.style.display = "none";
                document.getElementById("play-all-button").style.display = "none";
                document.getElementById("modal-title").style.display = "none";
            }
        }

        function findRuntime(time){ //passes in runtime in seconds
            var seconds = time%60;
            var min = time /60;
            if(seconds<10){
                var temp = ("0" + seconds).slice(-2);
                seconds = temp;
            }
            var timeString = Math.floor(min).toString() + ":" + seconds.toString();
            return timeString;
        }

        document.getElementById("table-song-col").addEventListener('click',()=>{
            sortTable(0); 
        });
        document.getElementById("table-artist-col").addEventListener('click',()=>{
            sortTable(1); 
        });
        document.getElementById("table-album-col").addEventListener('click',()=>{
            sortTable(2); 
        });
        document.getElementById("table-time-col").addEventListener('click',()=>{
            sortTable(3); 
        });

        function sortTable(n) {
            var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
            table = document.getElementById("song-table");
            rows = table.rows
            quicksort(rows, 1,rows.length-1,n);
        }
        function quicksort(rows, left, right,col){
            if(left >= right) {
                return;
            }
            var table = document.getElementById("song-table"); 
            var rows = table.rows; 
            var index = partition(rows,left,right,col); 
            quicksort(rows, left,index-1,col); 
            quicksort(rows, index, right, col); 

        }
        function partition(rows, left, right, col){
            pivot = rows[left].getElementsByTagName("td")[col]; 
            var leftPtr = left; 
            var rightPtr = right; 
            while(leftPtr <= rightPtr){
                while(rows[leftPtr].getElementsByTagName("td")[col].innerHTML.toLowerCase() < pivot.innerHTML.toLowerCase()){
                    leftPtr++; 
                }
                while(rows[rightPtr].getElementsByTagName("td")[col].innerHTML.toLowerCase() > pivot.innerHTML.toLowerCase()){
                    rightPtr--; 
                }
                if(leftPtr <= rightPtr){
                    swap(rows, leftPtr, rightPtr); 
                    leftPtr++;
                    rightPtr--;
                }
            } 
            return leftPtr; 
        }

        function swap(rows, i, j) {
            rows[i].parentNode.insertBefore(rows[i],rows[j]); 
            rows[j].parentNode.insertBefore(rows[j],rows[i]);
        }
        
        //var alb = music.api.library.albums().then((albums) => {alb = albums});
        window.setInterval(updateSlider, 500);
        function updateSlider(){
            var progress = music.player.currentPlaybackProgress * 100;
            var scrub = document.getElementById("playbackScrubber");
            if(music.player.currentPlaybackProgress != undefined)
                scrub.value = music.player.currentPlaybackProgress * 100;
        }

        var slider = document.getElementById("playbackScrubber");
        slider.oninput = function(){
            var totalLengthSec = music.player.currentPlaybackDuration;
            console.log("totalLengthSec", totalLengthSec);
            console.log("slider value",slider.value);
            var seekTime = slider.value * (totalLengthSec/100);
            console.log("seek time", seekTime);
            music.player.seekToTime(seekTime);
        }

        // update function gets called every 1.3 seconds. put any code that needs to be called repeatly here
        window.setInterval(updateInfo, 1333);
        // must do music.player.nowPlayingItem == null  check
        function updateInfo(){           
            // Update message to user if logged in or not
            document.getElementById('time').innerHTML = findRuntime(music.player.currentPlaybackProgress);

            if (music.isAuthorized){ 
                document.getElementById('login').innerHTML = "You are currently logged in. Welcome!"
                document.getElementById('login-btn').innerHTML = "Logout";
            }
            else
                document.getElementById('login').innerHTML = "Log in for full access to these features."

            // Update icon for play & pause
            if (music.player.isPlaying  == true){
                document.getElementById('playpause-btn').innerHTML = '<span style="color: #A9CEF4"><i class="fa fa-pause" aria-hidden="true"></span></i>';
            }
            else
                document.getElementById('playpause-btn').innerHTML = '<span style="color: #A9CEF4"><i class="fa fa-play" aria-hidden="true"></span></i>';

            if(music.player.currentBufferedProgress != 100 && music.player.currentBufferedProgress > 0){
                // buffering still
                console.log("buffering");
                document.getElementById("load").style.display = "grid";
            }
            else{
                //not buffering
                document.getElementById("load").style.display = "none";
            }


            //-- do not append NEW code below
            var lastSongTitle = document.getElementById("npName")
            if( music.player.isPlaying == true && (document.getElementById("npName").textContent != null || document.getElementById("npName").textContent != music.player.nowPlayingItem.attributes.name) ){

               /*
                var image = document.getElementById("art-display");
                //console.log("is playing-- changing art");
                
                var temp1 = music.player.nowPlayingItem.artworkURL;
                if (temp1 != undefined)
                    image.src= temp1;
                else
                    image.src= "https://i.imgur.com/9x96RH6.png";
                //console.log(temp1);
                var temp2 = music.player.nowPlayingItem.attributes.name;
                document.getElementById("npName").textContent= temp2;
                var temp3 = music.player.nowPlayingItem.attributes.artistName;
                document.getElementById("npArtist").textContent= temp3
                var temp4 = music.player.nowPlayingItem.attributes.albumName;
                document.getElementById("npAlbum").textContent= temp4;
                */
            }
            else if(music.player.isPlaying == true){
                //music is playing, same song as last check
                console.log("do nothing");
            }
            else{
                //not playing
                console.log("not playing");
                var image = document.getElementById("art-display");
                // display no song playing artwork image
                //image.src= "https://i.imgur.com/9x96RH6.png"; //commented OUT BY WILL

            }

        }

        function passPlaylistId(elementId, playlistObject){
            var element = document.getElementById(elementId); 
            element.setAttribute("data-id",playlistObject.id); 
            element.setAttribute("play-type", playlistObject.attributes.playParams.kind); 
        }
        function playQueueFromElement(elementId){
            var element = document.getElementById(elementId); 
            var id = element.attributes["data-id"].nodeValue; 
            var type = element.attributes["play-type"].nodeValue; 
            music.setQueue({[type]: id}).then(function (){
                music.play(); 
                isPlaying = true; 
            });
        }
        function deleteSongsOnTable(tableID){
            var table = document.getElementById(tableID); 
            for (var i = table.rows.length - 1; i > 0; i--)
                table.deleteRow(i);
        }

        function showSongsOnTable(tableID, songs)
        {
            var table = document.getElementById(tableID); 
            for (var i = 0; i < songs.length; i++) {
              // console.log(songs[i]);
              var obj = songs[i];
              var row = table.insertRow();
              row.setAttribute("id", "table-list", 0);
              var songCol = row.insertCell(0);
              var artistCol = row.insertCell(1);
              var albumCol = row.insertCell(2);
              var timeCol = row.insertCell(3);
              var songId = row.insertCell(4);
              var songType = row.insertCell(5);

              songCol.innerHTML = obj.attributes.name;
              artistCol.innerHTML = obj.attributes.artistName;
              albumCol.innerHTML = obj.attributes.albumName;
              timeCol.innerHTML = findRuntime(Math.floor(obj.attributes.durationInMillis / 1000));
              songId.innerHTML = obj.id;
              songType.innerHTML = obj.attributes.playParams.kind;
            }
        }
              // click listener for left list in split list view :D
        document.getElementById("list-left").addEventListener("click",function(e) {
            var id = e.toElement.attributes['data-id'].nodeValue;
            var playType = e.toElement.attributes['play-type'].nodeValue; 
            var dataType = e.toElement.attributes['data-type'].nodeValue; 
            var table = document.getElementById("song-table-right"); 
            console.log("info:", id, dataType, playType); 
            // displayList(5,id);//when single clicking on item, load songs in right view table

            var promise; 
            if(dataType == "library-playlists")
            {
                var promise = music.api.library.playlist(id); 
            }
            else if(dataType == "library-albums")
            {
                var promise = music.api.library.album(id);
            }
            else if(dataType == "playlists")
            {
                var promise = music.api.playlist(id);
            }
            else if(dataType == "albums")
            {
                var promise = music.api.album(id); 
            }
            promise.then(array => {
                var songs = array.relationships.tracks.data;
                deleteSongsOnTable("song-table-right"); 
                showSongsOnTable("song-table-right", songs); 
                passPlaylistId("play-all-button", array); 
            }); 
        });
        
        document.getElementById("play-all-button").addEventListener('click',function(e){
            playQueueFromElement("play-all-button"); 
        });

        //double click listener for left list in split list view
        document.getElementById('list-left').addEventListener('dblclick', function(e) {
            var id = e.toElement.attributes['data-id'].nodeValue;
            var type = e.toElement.attributes['data-type'].nodeValue; 
            //console.log("dbl click",id,type);
            if (type == 'library-playlists')
                type = 'playlist';
            //console.log("new id",id);

            music.stop().then(function() {
                music.setQueue({[type]: id}).then(function() {
                    music.play();
                    isPlaying = true;
                });
            });
              //console.log('done dbl click');
        });

          //click listener for right listin split list view
        document.getElementById('song-table-right').addEventListener('dblclick', function(e){
            songId = e.toElement.parentNode.getElementsByTagName('td')[4].innerHTML;
            idType = e.toElement.parentNode.getElementsByTagName('td')[5].innerHTML;
            music.stop().then(function() {
                music.setQueue({[idType]: songId}).then(function() {
                    music.play();
                    isPlaying = true;   
                });
            });
        });

        document.getElementById("song-table").addEventListener("dblclick", function(e){
            songId = e.toElement.parentNode.getElementsByTagName('td')[4].innerHTML;
            idType = e.toElement.parentNode.getElementsByTagName('td')[5].innerHTML;          
            music.stop().then(function() {
                music.setQueue({[idType]: songId}).then(function() {
                    music.play();
                    isPlaying = true; 
                });
            });
        });


        // coverflow event handling

        $(document).on('mouseenter', '.cover', function () {
        // console.log("sup");
            $('.active').removeClass('active');
            $(this).addClass("active");
        }).on('mouseleave', '.cover', function () {
        // console.log("mouse left");
        });
        

        $(document).on('click','.active',function(){
            // alert('active');
            var itemID = $(this).data("id");
            var itemType = $(this).data("type")

            var promise; 
                if(itemType == "library-playlists")
                {
                    promise = music.api.library.playlist(itemID); 
                }
                else if(itemType == "library-albums")
                {
                    promise = music.api.library.album(itemID);
                }
                else if(itemType == "playlists")
                {
                    promise = music.api.playlist(itemID);
                }
                else if(itemType == "albums")
                {
                    promise = music.api.album(itemID); 
                }
                promise.then(array => {
                    var songs = array.relationships.tracks.data;
                    console.log("clicked and loaded:",songs);
                    deleteSongsOnTable("song-table-right");
                    showSongsOnTable("song-table-right", songs);
                    passPlaylistId("play-all-button",array); 

                }); 
                modal.style.display = "block";
                document.getElementById("play-all-button").style.display = ""; 

        }); 



        window.onscroll = function() {onScrollFunc()};

    // Get the navbar
        var navbar = document.getElementById("top-bar");

    // Get the offset position of the navbar
        var sticky = navbar.offsetTop;


        function clearQ(){
            while(music.player.queue.length != 0){
                music.player.queue.remove(1);
            }
            console.log(music.player.queue.length);
        }

        // expose our instance globally for testing
        window.music = music;
    });
});

function resizeGrid() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    document.getElementById("overall-grid-container").style.width = w + "px";
    document.getElementById("overall-grid-container").style.height = h + "px";
}

