'use strict';
angular.module('portailApp')
    .directive('fileChanged', function () {
    return { restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('change', scope.$eval(attrs.fileChanged));
        } };
})
    .component('avatar', { controller: ['currentUser', 'URL_ENT', 'User',
        function (currentUser, URL_ENT, User) {
            var ctrl = this;
            ctrl.URL_ENT = URL_ENT;
            ctrl.processing = false;
            var blobToDataURL = function (blob, callback) {
                var a = new FileReader();
                a.onload = function (e) { callback(e.target.result); };
                a.readAsDataURL(blob);
            };
            var dataURItoBlob = function (dataURI) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString = (dataURI.split(',')[0].indexOf('base64') >= 0) ? atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1]);
                // separate out the mime component
                var mimeString = dataURI.split(',')[0]
                    .split(':')[1]
                    .split(';')[0];
                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ia], { type: mimeString });
            };
            var processFile = function (file) {
                ctrl.processing = true;
                var max_height = 256;
                var max_width = 256;
                blobToDataURL(file, function (dataURL) {
                    var img = new Image();
                    ctrl.user.new_avatar.image = dataURL;
                    img.onload = function () {
                        ctrl.user.new_avatar.height = img.height;
                        ctrl.user.new_avatar.width = img.width;
                        // Compute new dimensions if necessary
                        var factor = 1;
                        if (ctrl.user.new_avatar.width > max_width) {
                            factor = max_width / img.width;
                            ctrl.user.new_avatar.width = max_width;
                            ctrl.user.new_avatar.height = img.height * factor;
                        }
                        if (ctrl.user.new_avatar.height > max_height) {
                            factor = max_height / img.height;
                            ctrl.user.new_avatar.height = max_height;
                            ctrl.user.new_avatar.width = img.width * factor;
                        }
                        // create new, resized image blob using canvas
                        var canvas = document.createElement('canvas');
                        canvas.width = ctrl.user.new_avatar.width;
                        canvas.height = ctrl.user.new_avatar.height;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, ctrl.user.new_avatar.width, ctrl.user.new_avatar.height);
                        ctrl.user.new_avatar.image = canvas.toDataURL();
                        ctrl.user.new_avatar.blob = dataURItoBlob(ctrl.user.new_avatar.image);
                    };
                    img.src = ctrl.user.new_avatar.image;
                    ctrl.processing = false;
                });
            };
            ctrl.onChange = function (event) {
                processFile(event.target.files[0]);
            };
            var reset_new_avatar = function () {
                ctrl.user.new_avatar = { image: null,
                    blob: null,
                    width: 0,
                    height: 0 };
            };
            ctrl.upload_avatar = function () {
                ctrl.user.$upload_avatar()
                    .then(function (response) {
                    reset_new_avatar();
                });
            };
            ctrl["delete"] = function () {
                ctrl.user.avatar = 'empty';
                ctrl.user.$update();
            };
            ctrl.$onInit = function () {
                currentUser.get(false).then(function (user) {
                    ctrl.user = user;
                    reset_new_avatar();
                });
            };
        }],
    template: "\n<div class=\"avatar\">\n    <img draggable=\"false\" class=\"svg\"\n         ng:src=\"{{$ctrl.user.new_avatar.image ? $ctrl.user.new_avatar.image : $ctrl.URL_ENT + '/' + $ctrl.user.avatar}}\" />\n    <button style=\"position: absolute; top: 0; right: 0;\"\n            title=\"Supprimer l'avatar existant\"\n            ng:if=\"!$ctrl.user.new_avatar.blob\"\n            ng:click=\"$ctrl.delete()\">\n        <span class=\"glyphicon glyphicon-remove\"\n              style=\"color: red;\" ></span>\n    </button>\n\n    <input type=\"file\" file-changed=\"$ctrl.onChange\" ng:if=\"!$ctrl.processing\"/>\n    <span ng:if=\"$ctrl.processing\"><i class=\"fa fa-spinner fa-pulse\"></i> traitement</span>\n    <footer>\n        <button ng:disabled=\"!$ctrl.user.new_avatar.blob\"\n                ng:click=\"$ctrl.upload_avatar()\">Valider l'avatar</button>\n    </footer>\n</div>\n"
});
