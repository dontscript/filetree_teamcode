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

CodeMirror.modeURL = "/libs/codemirror/mode/%N/%N.js";
function change(modeValue, codeMirrorValue) {
    // console.log(modeValue);
    var val = modeValue, m, mode, spec;
    if (m = /.+\.([^.]+)$/.exec(val)) {
        var info = CodeMirror.findModeByExtension(m[1]);
        if (info) {
            mode = info.mode;
            spec = info.mime;
        }
    } else if (/\//.test(val)) {
        var info = CodeMirror.findModeByMIME(val);
        if (info) {
            mode = info.mode;
            spec = val;
        }
    } else {
        mode = spec = val;
    }
    if (mode) {
        codeMirrorValue.setOption("mode", spec);
        CodeMirror.autoLoadMode(codeMirrorValue, mode);
        // document.getElementById("modeinfo").textContent = spec;
    }
    else {
        console.log("Could not find a mode corresponding to " + val);
    }
}

function getURL(url, c) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status < 400) return c(null, xhr.responseText);
        var e = new Error(xhr.responseText || "No response");
        e.status = xhr.status;
        c(e);
    };
}


function setupCodeMirror(fileURL) {
    myCM[fileURL] = CodeMirror.fromTextArea(document.getElementById("editor_" + fileURL),
        {
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {"Ctrl-Space": "autocomplete", "Ctrl-F": "findPersistent", "Ctrl-J": "toMatchingTag"},
            // mode: {name: "text/html", globalVars: true},
            mode: 'text/plain',
            selectionPointer: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            tabSize: 2,
            gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "breakpoints"],
            lint: true,
            // theme: theme,
            scrollbarStyle: "simple",
            profile: 'xhtml',
            matchTags: {bothTags: true},
            matchBrackets: true
        });
    emmetCodeMirror(myCM[fileURL]);

    var server;
    getURL("//ternjs.net/defs/ecmascript.json", function (err, code) {
        if (err) throw new Error("Request for ecmascript.json: " + err);
        server = new CodeMirror.TernServer({defs: [JSON.parse(code)]});
        myCM[fileURL].setOption("extraKeys", {
            "Ctrl-Space": function (cm) {
                server.complete(cm);
            },
            "Ctrl-I": function (cm) {
                server.showType(cm);
            },
            "Ctrl-O": function (cm) {
                server.showDocs(cm);
            },
            "Alt-.": function (cm) {
                server.jumpToDef(cm);
            },
            "Alt-,": function (cm) {
                server.jumpBack(cm);
            },
            "Ctrl-Q": function (cm) {
                server.rename(cm);
            },
            "Ctrl-.": function (cm) {
                server.selectName(cm);
            },
            "Ctrl-Alt-L": function (cm) {
                // autoFormatSelection(myCM[fileURL]);
                console.log({line:0, ch:0}, {line: cm.lineCount()});
                cm.autoFormatRange({line:0, ch:0}, {line: cm.lineCount()});
            }
        })
        myCM[fileURL].on("cursorActivity", function (cm) {
            // if (timeoutCur) {
            //     clearTimeout(timeoutCur);
            // }
            // var timeoutCur = setTimeout(() => {
            //     server.updateArgHints(cm);
            // }, 2000);
            server.updateArgHints(cm);
            // server.updateArgHints(cm);
            // server.getHint(cm, (c) => {
            //     console.log(c);
            // });
            // console.log(server.updateArgHints(cm));
            // console.log(myCM[fileURL].firstLine());
        });
        var timeout;
        myCM[fileURL].on("keyup", function (cm, event) {
            var popupKeyCodes = {
                "9": "tab",
                "13": "enter",
                "27": "escape",
                "33": "pageup",
                "34": "pagedown",
                "35": "end",
                "36": "home",
                "38": "up",
                "40": "down"
            }

            if (!popupKeyCodes[(event.keyCode || event.which).toString()] && !myCM[fileURL].state.completionActive) {
                // if (timeout) clearTimeout(timeout);
                // timeout = setTimeout(function () {
                //     // console.log('showing hint');
                //     // CodeMirror.showHint(cm, CodeMirror.hint.javascript, {completeSingle: false});
                //     server.complete(cm)
                // }, 150);
                // console.log(server);
                // server.complete(cm);
            }
        });
    });

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
var arr_oldFileURL = [];
function updateRenameTabs(idOld, idNew, name) {
    console.log(idOld, idNew, name);
    let element = document.getElementById('tab_' + idOld);
    if (element != null)  {
        arr_oldFileURL.push(idOld);
        if (idOld === idNew) {
            element.childNodes[0].textContent = filterNameTab(name);
        }
        else {
            element.id = 'tab_' + idNew;
            element.title = b64DecodeUnicode(idNew);
            element.childNodes[0].textContent = filterNameTab(name);
            element.childNodes[1].id = idNew;
        }
        deleteAllOldEditor();
        openEditor(idNew, name);
    }
    // console.log(element.childNodes);
}

function updateDeleteTabs(id) {
    let element = document.getElementById('tab_' + id);
    if (/\bactive-editor\b/.test(element.className)) {
        closeEditor(id, true, true);
    }
    else {
        closeEditor(id);
    }
}

function updateMoveTabs(idOld, idNew) {
    let element = document.getElementById('tab_' + idOld);
    if (element != null) {
        arr_oldFileURL.push(idOld);
        if (idOld !== idNew) {
            element.id = 'tab_' + idNew;
            element.title = b64DecodeUnicode(idNew);
            element.childNodes[1].id = idNew;
        }
        deleteAllOldEditor();
        openEditor(idNew, element.getAttribute('name'));
    }
}

function deleteAllOldEditor() {
    if (arr_oldFileURL.length != 0) {
        for (let oldFileURL of arr_oldFileURL) {
            myCM[oldFileURL].toTextArea();
            delete myCM[oldFileURL];
            $('textarea[id="editor_' + oldFileURL + '"]').remove();

            let index = arr_oldFileURL.indexOf(oldFileURL);
            if (index > -1) {
                arr_oldFileURL.splice(index, 1);
            }
        }
    }
}

function getSelectedRange(cm) {
    return {from: cm.firstLine(), to: cm.lineCount()};
}

function autoFormatSelection(cm) {
    var range = getSelectedRange(cm);
    cm.autoFormatRange(range.from, range.to);
}

function filterNameTab(name) {
    if (name.length > 8) {
        return name.substr(0, 8) + '...';
    }
    return name;
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

var arr_fileURL = [];
function openEditor(fileURL, name) {
    // var fileURL = prompt('Your file?');
    if (isEditorActive()) {
        var fileURLToClose = $('.' + ACTIVE_EDITOR).attr('id').split('_')[1];
        $('.' + ACTIVE_EDITOR).removeClass(ACTIVE_EDITOR);
        closeEditor(fileURLToClose, false);
    }

    if (arr_fileURL.indexOf(fileURL) < 0) {
        arr_fileURL.push(fileURL);
        if (fileURL != null) {
            if (fileURL.length != 0) {
                if (!isTabExist(fileURL)) {
                    // var tempElement = document.createElement('div');
                    // tabEditorElement.className = 'tab_editors ' + ACTIVE_EDITOR;
                    // tabEditorElement.id = 'tab_' + fileURL;
                    // tabEditorElement.title = b64DecodeUnicode(fileURL);

                    $('#tab_editor').append('<div class="tab_editors ' + ACTIVE_EDITOR + '" id="tab_' + fileURL + '" title="' + b64DecodeUnicode(fileURL) + '" name="' + name + '"><span class="file-name">' + filterNameTab(name) + '</span><span class="close_tab" id="' + fileURL + '">x</span></div>');

                    var editorCloseId = `span[id='${fileURL}']`;
                    $(editorCloseId).on('click', function () {
                        // console.log($(this).attr('id'));
                        if ($(this).parent().hasClass(ACTIVE_EDITOR)) {
                            //console.log('has class');
                            closeEditor($(this).attr('id'), true, true);
                        }
                        else {
                            //console.log('no has');
                            closeEditor($(this).attr('id'));
                        }
                    });
                    // var testID = '#tab_' + fileURL;
                    // console.log(typeof testID);
                    var tabEditorId = `div[id='tab_${fileURL}']`;
                    $(tabEditorId).on('click', function () {
                        //không hiểu vì sao chỗ này đặt tên tab là "last" mà tên hiện lên vẫn giữ đúng file-name
                        //same problem with line 296
                        console.log($(this).attr('id').split('_')[1]);
                        openEditor($(this).attr('id').split('_')[1], name);
                    });
                }

                $('div[id="tab_' + fileURL + '"]').addClass(ACTIVE_EDITOR);

                $('#editors').append('<textarea class="editor" id="editor_' + fileURL + '"></textarea>');
                setupCodeMirror(fileURL);
                change(name, myCM[fileURL]);
                setupSocket(fileURL);
                sockets[fileURL].emit('getFileContent', fileURL);
            }
        }
    }
}


function closeEditor(fileURL, isIncludeTab = true, isActiveEditor = false) {
    // var fileURL = prompt('Your file?');
    console.log(myCM);
    if (fileURL != null) {
        if (fileURL.length != 0) {

            if (!(typeof myCM[fileURL] === 'undefined')) {
                myCM[fileURL].toTextArea();
                delete myCM[fileURL];
            }

            $('textarea[id="editor_' + fileURL + '"]').remove();
            if (isIncludeTab) {
                if (isActiveEditor) {
                    var element = $('div[id="tab_' + fileURL + '"]').next();
                    if (element.length) {
                        element.addClass(ACTIVE_EDITOR);
                        openEditor(element.attr('id').split('_')[1], element.attr('name'));
                    }
                    else {
                        element = $('div[id="tab_' + fileURL + '"]').prev();
                        if (element.length) {
                            element.addClass(ACTIVE_EDITOR);
                            openEditor(element.attr('id').split('_')[1], element.attr('name'));
                        }
                    }
                }
                $('div[id="tab_' + fileURL + '"]').remove();
            }
            var index = arr_fileURL.indexOf(fileURL);
            if (index > -1) {
                arr_fileURL.splice(index, 1);
            }

            if (!(typeof sockets[fileURL] === 'undefined')) {
                sockets[fileURL].disconnect();
                delete sockets[fileURL];
            }
        }
    }
}

function isTabExist(fileURL) {
    if ($('div[id="tab_' + fileURL + '"]').length)
        return true;
    return false;
}

function isEditorActive() {
    if ($('#tab_editor .active-editor').length)
        return true;
    return false;
}
