// ==UserScript==
// @name         Torn Vocal Chainerz
// @version      0.7
// @description  Speak up when 1 minute is left on the Torn Chain
// @author       Helcostr [1934501]
// @match        https://www.torn.com/*
// @grant        none
// @run-at      document-start
// @updateURL   https://github.com/Helcostr/helcostr-torn-userscripts/raw/master/Userscripts/echo_vchain.user.js
// ==/UserScript==
(function() {
    'use strict';

    setInterval(async ()=>{
        let time = localStorage.getItem("vc_faction_keepalive");
        if (time == null || parseInt(time)+10000<Date.now())
            speak("Warning","vc_faction_warning");
    },2500);
    const original_fetch = fetch;
    let warning = false;
    window.fetch = async (input, init) => {
        let start = Date.now();
        const response = await original_fetch(input, init);
        let end = Date.now();
        if (response.url.search('faction_wars.php') != -1) {
            if (response.url.search('redirect=false&step=getwardata&factionID=0&userID=0&wardescid=chain') != -1) {
                const clone = response.clone();
                let payload = typeof init.body != 'undefined' ? JSON.parse(init.body) : {};

                clone.json().then((response) => {
                    console.log(end-start,"time");
                    if (response.wars[0].data.chain.factionID == 11428) {
                        try {
                            localStorage.setItem("vc_faction_keepalive",Date.now());
                            let seconds = response.wars[0].data.chainBar.end;
                            let recents = response.warDesc.recentAttacks;
                            if (seconds < 70) {
                                if (recents.some(e=> e.result == "Undecided" && e.finishTimestamp+30000 < response.wars[0].data.chain.end))
                                    speak("Pending","vc_faction_assist");
                                warning = true;
                                speak(secToTime(seconds),"vc_faction_main");
                            } else if (warning) {
                                warning = false;
                                speak('Hit Confirmed',"vc_faction_main");
                            } else
                                console.log(response.warDesc);
                        } catch(e) {console.log(response);}

                    }
                });
            }
        }
        return response;
    }

    function speak(text,overlap_key) {
        let time = localStorage.getItem(overlap_key);
        if (time == null || parseInt(time)+2500<Date.now()) {
            let msg = new SpeechSynthesisUtterance();
            let voices = window.speechSynthesis.getVoices();
            msg.voice = voices[0]; // Note: some voices don't support altering params
            msg.voiceURI = 'native';
            msg.volume = 1; // 0 to 1
            msg.rate = 1.5; // 0.1 to 10
            msg.pitch = 1; //0 to 2

            msg.lang = 'en-US';
            msg.text = text;
			speechSynthesis.cancel();
            speechSynthesis.speak(msg);
            localStorage.setItem(overlap_key,(new Date).getTime());
        }
    }

    function secToTime(duration) {
        var seconds = parseInt((duration) % 60),
            minutes = parseInt((duration / (60)) % 60),
            hours = parseInt((duration / (60 * 60)) % 24);

        return (hours != 0 ? hours + ' hours ' : '') + (minutes != 0 ? minutes + ' minutes ' : '') + (seconds != 0 ? seconds : '');
    }
})();
