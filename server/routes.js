(function () {

    'use strict';
    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var fse = require('fs-extra');
    var path = require('path');
    var url = require('url');
    var sep = require('path').sep;
    var mime = require('mime');
    // var archiver = require('archiver');
    // var AdmZip = require('adm-zip');
    var zipFolder = require('zip-folder');

    //const treeRoot = 'C:\\Users\\User\\Downloads\\Desktop\\file_explorer\\teamcode\\';
    const treeRoot = "F:\\Git\\filetree_teamcode\\teamcode";
    
    /* GET home page. */
    router.get('/', function (req, res) {
        res.render('index');
    });

    /* Serve the Tree */
    router.get('/api/tree', function (req, res) {
        console.log('get ', req.query);
        // console.log('URL', path.resolve(__dirname, '..', 'teamcode'));
        // get cookies email
        var _path;
        if (req.query.id == 1) {
            // _path = path.resolve(__dirname, '..', 'donguyen@gmail.com');
            _path = path.join(treeRoot, 'donguyen@gmail.com');
            processReq(_path, res);

        } else {
            if (req.query.id) {
                _path = decodeBase64(req.query.id);
                _path = path.join(treeRoot, _path);
                processReq(_path, res);
            } else {
                res.json(['No valid data found']);
            }
        }
    });

    /* Serve a Resource */
    router.get('/api/resource', function (req, res) {
        res.send(fs.readFileSync(path.join(treeRoot, decodeBase64(req.query.resource)), 'UTF-8'));
    });

    router.post('/api/action', function (req, res) {
        var operation = req.query.operation;
        if (operation === "rename_node") {
            renameNode(decodeBase64(req.body.id), req.body.text, decodeBase64(req.body.parent), res);
        }
        if (operation === "delete_node") {
            deleteNode(decodeBase64(req.body.id), res);
        }
        if (operation === "create_node") {
            createNode(req.body.type, decodeBase64(req.body.parent), req.body.text, res);
        }
        if (operation === "copy_node") {
            copyNode(decodeBase64(req.body.id), decodeBase64(req.body.parent), req.body.text, res);
        }
        if (operation === "move_node") {
            moveNode(decodeBase64(req.body.id), decodeBase64(req.body.parent), req.body.text, res);
        }
        if (operation === "download_node") {
            downloadNode(decodeBase64(req.body.url), res);
        }
    });

    function downloadNode(url, res) {
        var URL = path.join(treeRoot, url);
        zipFolder(URL, path.resolve(__dirname, '..', 'teamcode', 'archive.zip'), function (err) {
            if (err) {
                console.log('oh no!', err);
            } else {
                res.download(path.resolve(__dirname, '..', 'teamcode', 'archive.zip'), function (err) {
                    fs.unlink(path.resolve(__dirname, '..', 'teamcode', 'archive.zip'), function (err) {
                        console.log(err);
                    });
                });

            }
        });
    }

    function encodeBase64(text) {
        return new Buffer(text).toString('base64');
    }

    function decodeBase64(text) {
        return new Buffer(text, 'base64').toString('ascii');
    }

    function copyNode(id, parent, text, res) {
        fse.copy(path.join(treeRoot, id), path.join(treeRoot, parent, text), function (err) {
            if (err) throw err;
            res.status(200).send('OK!');
        })
    }

    function moveNode(id, parent, text, res) {
        fse.move(path.join(treeRoot, id), path.join(treeRoot, parent, text), function (err) {
            if (err) throw err;
            res.status(200).send('OK!');
        })
    }

    function createNode(type, parent, text, res) {
        console.log('create', type, parent, text);
        var URL = path.join(treeRoot, parent, text);
        if (type === 'folder') {
            fs.mkdir(URL, function (err) {
                if (err) throw err;
                res.send({id: encodeBase64(URL.replace(treeRoot, ""))});
            });
        }
        else {
            fs.close(fs.openSync(URL, 'w'), function (err) {
                if (err) throw err;
                res.send({id: encodeBase64(URL.replace(treeRoot, ""))});
            });
        }
    }

    function renameNode(id, text, parent, res) {
        console.log('rename', id, text);
        if (/[^a-zA-Z0-9\.\s\[\(\]\)\_]/.test(text)) {
            res.status(500).send('Something wrong!');
        }
        else {
            var URL = path.join(treeRoot, parent, text);
            console.log('rename url ' + URL);
            var checkExistsURL = fs.existsSync(URL);
            if (!checkExistsURL) {
                fs.rename(path.join(treeRoot, id), URL, function (err) {
                    if (err) throw err;
                    res.send({id: encodeBase64(URL.replace(treeRoot, ""))});
                });
            }
            else {
                res.status(500).send('Something wrong!x');
            }

        }
    }

    function deleteNode(id, res) {
        if (fs.statSync(path.join(treeRoot, id)).isDirectory()) {
            // fs.rmdir(path.join(treeRoot, id), function (err) {
            //     if (err) throw err;
            //     res.status(200).send('OK!');
            // });
            deleteFolder(path.join(treeRoot, id));
            res.status(200).send('OK!');
        }
        else {
            fs.unlink(path.join(treeRoot, id), function (err) {
                if (err) throw err;
                res.status(200).send('OK!');
            });
        }

    }

    function deleteFolder(_path) {
        if (fs.existsSync(_path)) {
            fs.readdirSync(_path).forEach(function (file, index) {
                var curPath = path.join(_path, file);
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(_path);
        }
    };

    function processReq(_path, res) {
        if (fs.statSync(_path).isDirectory()) {
            var resp = [];
            fs.readdir(_path, function (err, list) {
                for (var i = 0; i <= list.length - 1; i++) {
                    resp.push(processNode(_path, list[i]));
                }
                res.json(resp);
            });
        }
        else {
            res.status(200).send('OK');
        }
    }

    function processNode(_path, f) {
        // console.log('path ' + _path);
        // console.log('file ' + f);
        // console.log('root ' + path.join(_path, f).replace(treeRoot, ""));
        var s = fs.statSync(path.join(_path, f));
        return {
            "id": encodeBase64(path.join(_path, f).replace(treeRoot, "")),
            "text": f,
            "icon": s.isDirectory() ? 'jstree-folder' : 'jstree-file',
            "state": {
                "opened": false,
                "disabled": false,
                "selected": false
            },
            "li_attr": {
                "base": encodeBase64(path.join(_path, f).replace(treeRoot, "")),
                "isLeaf": !s.isDirectory()
            },
            "children": s.isDirectory(),
            "type": s.isDirectory() ? 'folder' : 'file'
        };
    }


    module.exports = router;

}());