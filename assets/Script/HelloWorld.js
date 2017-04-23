cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!',
        manifestUrl: cc.RawAsset,
    },

    checkCb: function (event) {
        cc.log('GG_: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log('GG_: ERROR_NO_LOCAL_MANIFEST');
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                cc.log('GG_: ERROR_DOWNLOAD_MANIFEST');
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log('GG_: ERROR_PARSE_MANIFEST');
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log('GG_: ALREADY_UP_TO_DATE');
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('GG_: NEW_VERSION_FOUND');
                break;
            default:
                cc.log('GG_: DEFAULT');
                return;
        }

        cc.eventManager.removeListener(this._checkListener);
        this._checkListener = null;
        this._updating = false;
    },
    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        if (!cc.sys.isNative) {
            return;
        }

        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'test-hotfix');
        cc.log("StoragePath = " + storagePath);
        this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }
        this._am.setVersionCompareHandle(function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }

        if (!this._am.getLocalManifest().isLoaded()) {
            cc.log('Failed to load local manifest ...');
            return;
        }
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);
        this._am.checkUpdate();

    },




});
