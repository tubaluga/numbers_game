VK.init(function () {
    var user_id = 11215408;   //id пользователя 
    var app_id = 5615916;  //id вашего приложения
    var a = new VKAdman();
    /*a.onNoAds(function () { console.log("Adman: No ads"); });
    a.onStarted(function () { console.log("Adman: Started"); });
    a.onCompleted(function () { console.log("Adman: Completed"); });
    a.onSkipped(function () { console.log("Adman: Skipped"); });
    a.onClicked(function () { console.log("Adman: Clicked"); });*/    
    a.setupPreroll(app_id);
    //a.setupPreroll(app_id, {preview: 8});
    admanStat(app_id, user_id);
});