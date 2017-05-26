(function () {
    'use strict';

    app.controller('HomeCtrl', ['$scope', 'FetchFileFactory', '$http', 'FileSaver', 'Blob',
        function ($scope, FetchFileFactory, $http, FileSaver, Blob) {
            $scope.fileViewer = 'Please select a file to view its contents';

            $scope.coreConfig = {
                'check_callback': function (o, n, p, i, m) {
                    if (m && m.dnd && m.pos !== 'i') {
                        return false;
                    }
                    if (o === "move_node" || o === "copy_node") {
                        if (this.get_node(n).parent === this.get_node(p).id) {
                            return false;
                        }
                    }
                    return true;
                },
                'themes': {
                    'responsive': true
                }
            };

            $scope.typesConfig = {
                "default": {
                    "icon": "folder"
                },
                "file": {
                    'valid_children': [],
                    "icon": "file"
                },
                "folder": {
                    "icon": "folder"
                }
            };

            $scope.contextMenuAction = function (node) {
                console.log(node);
                var tmp = $.jstree.defaults.contextmenu.items();
                delete tmp.create.action;
                tmp.create.label = "New";
                tmp.create.submenu = {
                    "Folder": {
                        "separator_after": true,
                        "label": "Folder",
                        "action": function (data) {
                            var inst = $.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
                            inst.create_node(obj, {
                                type: "folder",
                                icon: 'jstree-folder'
                            }, "last", function (new_node, a, b) {
                                console.log(new_node, a, b);
                                setTimeout(function () {
                                    inst.edit(new_node);
                                }, 0);
                            });
                        }
                    },
                    "File": {
                        "label": "File",
                        "action": function (data) {
                            var inst = $.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
                            inst.create_node(obj, {
                                type: "file",
                                icon: 'jstree-file',
                                li_attr: {isLeaf: true}
                            }, "last", function (new_node) {
                                setTimeout(function () {
                                    inst.edit(new_node);
                                }, 0);
                            });
                        }
                    }
                };
                // Refresh
                tmp.refresh = {};
                tmp.refresh.label = "Refresh";
                tmp.refresh.action = function (data) {
                    var inst = $.jstree.reference(data.reference),
                        node = inst.get_node(data.reference);
                    inst.refresh_node(node);
                }
                //download
                tmp.download = {};
                tmp.download.label = "Download";
                tmp.download.action = function (data) {
                    var inst = $.jstree.reference(data.reference),
                        node = inst.get_node(data.reference);
                    var url = node.id;
                    console.log(node);
                    $http({
                        url: 'api/action?operation=download_node',
                        method: 'POST',
                        data: {url: url},
                        responseType: 'arraybuffer'
                    }).then(function (response) {
                        console.log(response,response.headers()['content-type']);
                        var data = new Blob([response.data], { type: response.headers()['content-type'] });
                        FileSaver.saveAs(data, 'archive.zip');
                    }, function (error) {
                        console.log(error);
                    });
                }
                if ($.jstree.reference(node).get_type(node) === "file") {
                    delete tmp.create;
                    delete tmp.download;
                }
                return tmp;
            }

            // $('.tree-browser').on('dblclick','.jstree-anchor', function (e) {
            //     var instance = $.jstree.reference(this),
            //         node = instance.get_node(this);
            //     var _l = node.li_attr;
            //     if (_l.isLeaf) {
            //         FetchFileFactory.fetchFile(_l.id).then(function (data) {
            //             var _d = data.data;
            //             if (typeof _d == 'object') {
            //                 _d = JSON.stringify(_d, undefined, 2);
            //             }
            //             $scope.fileViewer = _d;
            //         });
            //     } else {
            //         $scope.$apply(function () {
            //             $scope.fileViewer = 'Please select a file to view its contents';
            //         });
            //     }
            // });

            $scope.nodeRename = function (e, data) {
                console.log('rename', e, data);
                if (data.old !== data.text) {
                    $http({
                        url: 'api/action?operation=rename_node',
                        method: 'POST',
                        data: {id: data.node.id, text: data.text, parent: data.node.parent}
                    }).then(function (response) {
                        data.instance.set_id(data.node, response.data.id);
                        data.node.li_attr.base = response.data.id;
                        data.instance.refresh_node(data.node);
                    }, function (error) {
                        console.log(error);
                        data.instance.refresh_node(data.node);
                    });
                }
            }

            $scope.nodeCopy = function (e, data) {
                console.log('copy', e, data);
                $http({
                    url: 'api/action?operation=copy_node',
                    method: 'POST',
                    data: {id: data.original.id, parent: data.parent, text: data.original.text}
                }).then(function (response) {
                    // data.instance.refresh_node(data.parent)
                    data.instance.load_node(data.parent);
                }, function (err) {
                    data.instance.refresh();
                });
            }

            $scope.nodeMove = function (e, data) {
                console.log('move', e, data);
                $http({
                    url: 'api/action?operation=move_node',
                    method: 'POST',
                    data: {id: data.node.id, parent: data.parent, text: data.node.text}
                }).then(function (response) {
                    // data.instance.refresh_node(data.parent)
                    data.instance.load_node(data.parent);
                }, function (err) {
                    data.instance.refresh();
                });
            }

            $scope.nodeDelete = function (e, data) {
                console.log('delete', e, data);
                $http({
                    url: 'api/action?operation=delete_node',
                    method: 'POST',
                    data: {id: data.node.id}
                }).then(function (response) {

                }, function (err) {
                    data.instance.refresh_node(data.node);
                });
            }

            $scope.nodeCreate = function (e, data) {
                console.log('create', e, data);
                $http({
                    url: 'api/action?operation=create_node',
                    method: 'POST',
                    data: {type: data.node.type, parent: data.node.parent, text: data.node.text}
                }).then(function (response) {
                    data.instance.set_id(data.node, response.data.id);
                }, function (err) {
                    data.instance.refresh_node(data.node);
                });
            }
            $scope.nodeSelected = function (e, data) {
                var _l = data.node.li_attr;
                if (_l.isLeaf) {
                    FetchFileFactory.fetchFile(_l.id).then(function (data) {
                        var _d = data.data;
                        if (typeof _d == 'object') {

                            //http://stackoverflow.com/a/7220510/1015046//
                            _d = JSON.stringify(_d, undefined, 2);
                        }
                        $scope.fileViewer = _d;
                    });
                    console.log(data.node.id);
                    openEditor(data.node.id, data.node.text);

                }
                // else {
                //
                //     //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html//
                //     $scope.$apply(function () {
                //         $scope.fileViewer = 'Please select a file to view its contents';
                //     });
                // }
            }
            // function openTab(URL) {
            //
            // }
            // function closeTab() {
            //
            // }
            resizeWidth();
            function resizeWidth() {
                var treeBrowserWidth = $('.tree-browser').width();
                var fileViewerWidth = $('.file-viewer').width();
                $('.split-pane-divider').mousedown(function(e) {
                    $('.ideview').on('mousemove', function(e) {
                        var diff = $('.split-pane-divider').offset().left + 1 - e.pageX;
                        $('.tree-browser').width($('.tree-browser').width() - diff);
                        $('.file-viewer').width($('.file-viewer').width() + diff);

                        $('#file-explorer').width($('#file-explorer').width() - diff);
                        $('#tab_editor').width($('#tab_editor').width() + diff);
                        if ($('.tree-browser').width() <= 100) {
                            $('.ideview').off('mousemove');
                        }
                    });
                });
                $('.ideview').on('mouseup', function() {
                    $('.ideview').off('mousemove');
                });
            }
        }
    ]);

}());