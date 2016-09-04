
function vk_init() {

    if (typeof VK == 'undefined') {
        return;
    }


    VK.init(function () {
        var user_id = 11215408; 
        var app_id = 5615916;
        var a = new VKAdman();
        a.setupPreroll(app_id);
        //a.setupPreroll(app_id, {preview: 8});
        admanStat(app_id, user_id);
    });

    setTimeout(function () {
        var adsParams = { "ad_unit_id": 76528, "ad_unit_hash": "b38eaf7f2830c45706c1ea729a143669" };
        function vkAdsInit() {
            VK.Widgets.Ads('vk_ads_76528', {}, adsParams);
        }
        if (window.VK && VK.Widgets) {
            vkAdsInit();
        } else {
            if (!window.vkAsyncInitCallbacks) window.vkAsyncInitCallbacks = [];
            vkAsyncInitCallbacks.push(vkAdsInit);
            var protocol = ((location.protocol === 'https:') ? 'https:' : 'http:');
            var adsElem = document.getElementById('vk_ads_76528');
            var scriptElem = document.createElement('script');
            scriptElem.type = 'text/javascript';
            scriptElem.async = true;
            scriptElem.src = protocol + '//vk.com/js/api/openapi.js?127';
            adsElem.parentNode.insertBefore(scriptElem, adsElem.nextSibling);
        }
    }, 0);

    game_singlethon.add_resize_listener(function (width, height) {
        VK.callMethod("resizeWindow", 800, height + 600);
    })
}

vk_init();
