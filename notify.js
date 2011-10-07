/*

Copyright (c) 2011, dealnews.com, Inc
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
 * Neither the name of dealnews.com, Inc nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

 */

Event = YAHOO.util.Event;
Dom = YAHOO.util.Dom;
Selector = YAHOO.util.Selector;
Anim = YAHOO.util.Anim;

var Notifier = function(config){

    this.container = null;

    this.timer = [],

    this.panelCount = 0,

    this.location = "br";
    if(config.location && (config.location == "tr" || config.location == "tl" || config.location == "bl")){

        this.location = config.location;

    }

    this.show = function(text, sticky, timeout) {

        if(this.container == null){
            this.container = document.createElement("div");
            if(this.location == "tl" || this.location == "tr"){
                this.container.className = "notify-area-top";
            } else {
                this.container.className = "notify-area";
            }
            document.body.appendChild(this.container);
        }

        this.panelCount++;

        var panel = document.createElement("div");
        panel.className = "notify";
        panel.id = "notify-panel-" + this.panelCount;
        panel.innerHTML = '<div class="bg"></div><div class="text">' + text + '</div>';
        if(sticky){
            panel.innerHTML += "<div class='sticky'>x</div>";
        }

        if(this.location=="br" && this.container.hasChildNodes()){
            this.container.insertBefore(panel, this.container.firstChild);
        } else {
            this.container.appendChild(panel);
        }

        Dom.setStyle(panel, "opacity", 0);
        Dom.setStyle(panel, "display", "block");

        var fadeIn = new Anim(panel, { opacity: { to: 1 } }, 0.25);
        fadeIn.animate();

        if(!sticky){

            currCount = this.panelCount;

            Event.addListener(panel, "mouseover", this.pause, this, true);
            Event.addListener(panel, "mouseout", this.hide, this, true);

            if(!timeout){
                timeout = 4000;
            }

            this.timer[this.panelCount] = YAHOO.lang.later(
                timeout,
                this,
                function(panel){
                    this.hide(panel);
                },
                panel,
                false
            );

        } else {

            Event.addListener(panel, "click", this.hide, this, true);
        }

    }

    this.hide = function(ev) {

        fadeTime = .5;

        panel = this.getPanel(ev);

        var fadeOut = new Anim(panel, { opacity: { to: 0 } }, fadeTime);

        fadeOut.onComplete.subscribe(function(){

            elems = Selector.query(".notify");

            doHide = true;

            for(e in elems){
                if(Dom.getStyle(elems[e], "opacity") != 0){
                    doHide = false;
                    break;
                }
            }

            if(doHide){
                this.container.innerHTML = "";
            }

        }, this, true);

        fadeOut.animate();
    }

    this.pause = function(ev) {

        panel = this.getPanel(ev);

        if(panel && Dom.getStyle(panel, "opacity") > 0){

            re = /notify-panel-([0-9]+)/;

            match = re.exec(panel.id);

            if(match){
                this.timer[match[1]].cancel();
                Dom.setStyle(panel, "opacity", 1);
                Dom.setStyle(panel, "display", "block");
            }
        }

    }

    this.getPanel = function(obj){

        // if no tagName, assume we have an event
        if(typeof obj.tagName == "undefined"){
            obj = Event.getTarget(obj);
        }

        while(!Dom.hasClass(obj, "notify")){
            if(obj.parentNode == window) break;
            obj = obj.parentNode;
        }

        return obj;
    }

}

