var theme = 'monokai';
var myCM = [];
var sockets = [];

const CURSOR_MODE = 'local'; //get cursor position from the top-left editor.
const ACTIVE_EDITOR = 'active-editor';


var username = prompt("Your name ?");
var timeToSyncRethinkDB;
var timeToHideCursorName = {};

function setupSocket(fileURL) {
    sockets[fileURL] = io.connect();
    sockets[fileURL].on('connect', function () {
        var connectionInfos = {};
        connectionInfos.room = fileURL;
        connectionInfos.username = username
        sockets[fileURL].emit('joinRoom', connectionInfos);
    });

    sockets[fileURL].on('receiveFileContent', function (data) {

        myCM[fileURL].getDoc().setValue(data);
        myCM[fileURL].focus();
        //myCodeMirror.setCursor({line: myCodeMirror.lastLine()});
    });

    sockets[fileURL].on('appendCursors', function (cursors) {
        var cursor;
        for (i = 0; i < cursors.length; i++) {
            cursor = cursors[i];
            $('.CodeMirror-lines div:first').prepend(cursor.value);
        }
    });

    sockets[fileURL].on('deleteCursor', function (username) {
        $('#' + username).remove();
    });

    sockets[fileURL].on('disconnect', function () {
    });

    sockets[fileURL].on('document-coming', function (data) {
        HandleDocumentComing(data);
    });

    sockets[fileURL].on('cursor-coming', function (data) {
        var fileURL = data.fileURL;
        if (data.username != username) {
            var cursorLine = data.line;
            var cursorChar = data.ch;

            //return of coordinate of cursor (left, right, top, bottom), when we have {line: , ch: }
            var cursorCoordinate = myCM[fileURL].cursorCoords({line: cursorLine, ch: cursorChar}, CURSOR_MODE);

            //setting attribute of cursor will place to right position
            var cursorElement = '#' + data.username + ' div';
            var cursorLeftPosition = cursorCoordinate.left + 'px';
            var cursorTopPosition = cursorCoordinate.top - 4 + 'px';
            $(cursorElement).css({left: cursorLeftPosition, top: cursorTopPosition});

            //setting attribute of username above it's cursor
            var cursorNameElement = '#' + data.username + ' div.cursor-name';
            var cursorNameLeftPosition = cursorCoordinate.left + 1 + 'px';
            var cursorNameTopPosition = cursorCoordinate.top - 22 + 'px';
            $(cursorNameElement).css({left: cursorNameLeftPosition, top: cursorNameTopPosition, display: 'block'});

            clearTimeout(timeToHideCursorName[data.username]);
            timeToHideCursorName[data.username] = setTimeout(function () {
                $(cursorNameElement).css({'display': 'none'});
            }, 2000);

        }
    });
}

function setupCodeMirror(fileURL) {
    myCM[fileURL] = CodeMirror.fromTextArea(document.getElementById("editor_" + fileURL),
        {
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {"Ctrl-Space": "autocomplete"},
            mode: {name: "text/html", globalVars: true},
            autoCloseTags: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            tabSize: 2,
            gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "breakpoints"],
            lint: true,
            theme: theme,
            profile: 'xhtml'
        });
    emmetCodeMirror(myCM[fileURL]);

    myCM[fileURL].on("gutterClick", function (cm, n) {
        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
    });

    //when cursor position change
    myCM[fileURL].getDoc().on('cursorActivity', function (cm) {
        var cursor = cm.getCursor();
        cursor['username'] = username;
        cursor['fileURL'] = fileURL;

        //static projectID, will change to dynamic later
        cursor['projectID'] = '112c12a8-53df-4ac0-a57a-f4b3f14401f4';
        sockets[fileURL].emit('cursor-update', cursor);
    });

    //when content of Editor change
    myCM[fileURL].on('change', function (cm, ob) {

        //this constant will make myCodeMirror.on('change') not detect replaceRange() function is a change.
        //prevent infinite loop
        const IGNORE_ONCHANGE_EVENT = '@ignore';

        if (ob['origin'] != 'setValue' && ob['origin'] != '@ignore') {
            ob['id'] = fileURL;
            ob['lastModified'] = username;
            ob['origin'] = IGNORE_ONCHANGE_EVENT;
            sockets[fileURL].emit('document-update', ob);
        }

        /*clearTimeout(timeToSyncRethinkDB);
         timeToSyncRethinkDB = setTimeout(function (){*/
        var date = new Date();
        var dateFormated = FormatDate(date);
        var message = {
            id: fileURL,
            value: myCM[fileURL].getValue(),
            lastModified: username,
            timeStamp: dateFormated
        };
        sockets[fileURL].emit('document-save', message);
        /*},1000);*/
    });
}

function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
}

function FormatDate(date) {
    var hour = date.getHours();
    if (hour < 10)
        hour = '0' + hour;

    var minute = date.getMinutes();
    if (minute < 10)
        minute = '0' + minute;

    var second = date.getSeconds();
    if (second < 10)
        second = '0' + second;

    var day = date.getDate();
    if (day < 10)
        day = '0' + day;

    var month = date.getMonth() + 1;
    if (month < 10)
        month = '0' + month;

    var dateFormat = hour + ':' + minute + ':' + second + ' ' + day + '/' + month + '/' + date.getFullYear();

    return dateFormat;
}

//when receiving input from other partners
function HandleDocumentComing(data) {

    var fileURL = data.id;
    var userUpdated = data.lastModified; //user make this event

    if (userUpdated != username) {
        var valueToAppend = data.text;
        delete data.username;
        delete data.projectID;
        var appendPosition = {'from': data.from, 'to': data.to};
        var documentOrigin = data.origin; //input, paste, cut, setValue ...

        myCM[fileURL].getDoc().replaceRange(valueToAppend, appendPosition.from, appendPosition.to, documentOrigin);

    }
}

function getSelectedRange(fileURL) {
    return {from: myCM[fileURL].getCursor(true), to: myCM[fileURL].getCursor(false)};
}

function autoFormatSelection() {
    var range = getSelectedRange();
    myCM[fileURL].autoFormatRange(range.from, range.to);
}
var arr_fileURL = [];
function openEditor(fileURL, name) {
    // var fileURL = prompt('Your file?');
    if (isEditorActive())
    {
        var fileURLToClose = $('.'+ACTIVE_EDITOR).attr('id').split('_')[1];
        $('.'+ACTIVE_EDITOR).removeClass(ACTIVE_EDITOR);
        closeEditor(fileURLToClose, false);
    }

    if (arr_fileURL.indexOf(fileURL) < 0) {
        arr_fileURL.push(fileURL);
        if (fileURL != null) {
            if (fileURL.length != 0) {
                if(!isEditorExist(fileURL))
                {
                    $('#tab_editor').append('<div class="tab_editors '+ACTIVE_EDITOR+'" id="tab_' + fileURL + '"><span class="file-name">' + name + '</span><span class="close_tab" id="' + fileURL +'">x</span></div>');
                    $('.close_tab').on('click', function() {
                        if ($(this).parent().hasClass(ACTIVE_EDITOR))
                        {
                            console.log('has class');
                            closeEditor($(this).attr('id'),true,true);
                        }
                        else
                        {
                            //console.log('no has');
                            closeEditor($(this).attr('id'));
                        }
                    });
                    $('.tab_editors').on('click', function() {
                        //không hiểu vì sao chỗ này đặt tên tab là "last" mà tên hiện lên vẫn giữ đúng file-name
                        //same problem with line 296
                        openEditor($(this).attr('id').split('_')[1],'last');
                    });
                }

                $('div[id="tab_'+fileURL+'"]').addClass(ACTIVE_EDITOR);

                $('#editors').append('<textarea class="editor" id="editor_' + fileURL + '"></textarea>');
                setupCodeMirror(fileURL);
                setupSocket(fileURL);
                sockets[fileURL].emit('getFileContent', fileURL);
            }
        }
    }
}

function closeEditor(fileURL, isIncludeTab = true, isActiveEditor = false) {
    // var fileURL = prompt('Your file?');
    //console.log(fileURL);
    if (fileURL != null) {
        if (fileURL.length != 0) {

            if (!(typeof myCM[fileURL] === 'undefined'))
            {
                myCM[fileURL].toTextArea();
                delete myCM[fileURL];
            }

            $('textarea[id="editor_' + fileURL + '"]').remove();
            if(isIncludeTab)
            {
                if (isActiveEditor)
                {
                    var element = $('div[id="tab_' + fileURL + '"]').next();
                    if(element.length)
                    {
                        element.addClass(ACTIVE_EDITOR);
                        openLastEditor(element.attr('id').split('_')[1]);
                    }
                    else
                    {
                        element = $('div[id="tab_' + fileURL + '"]').prev();
                        if(element.length)
                        {
                            element.addClass(ACTIVE_EDITOR);
                            openLastEditor(element.attr('id').split('_')[1]);
                        }
                    }
                }
                $('div[id="tab_' + fileURL + '"]').remove();
            }
            var index = arr_fileURL.indexOf(fileURL);
            if (index > -1) {
                arr_fileURL.splice(index, 1);
            }
            
            if(!(typeof sockets[fileURL] === 'undefined'))
            {
                sockets[fileURL].disconnect();
                delete sockets[fileURL];
            }
        }
    }
}


function openLastEditor(fileURL)
{    
    //không hiểu vì sao chỗ này đặt tên tab là last mà "auto được". giải thích hộ cái :|
    //same problem with line 232
    openEditor(fileURL,'last');
}


function isEditorExist(fileURL)
{
    if($('div[id="tab_'+fileURL+'"]').length)
        return true;
    return false;
}

function isEditorActive()
{
    if($('#tab_editor .active-editor').length)
        return true;
    return false;
}