/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright (c) 2013, Sergey Grebnov
 * All rights reserved.
 *
 */

(function(){
    // Adds support of unprefixed Pointer Events for IE10 (Dekstop and Windows Phone). See EVENTS_MAP below for more details. 
    // General information about Pointer Events can be found at https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html

    // Polyfill should work if browser supports ms-prefixed events only and shouldn't 
    // affect future releases with support of unprefixed pointer events names
    if (window.navigator.pointerEnabled || (!window.navigator.msPointerEnabled)) return;

    var EVENTS_MAP = {
        'MSPointerDown' : 'pointerdown',
        'MSPointerMove' : 'pointermove',
        'MSPointerUp' : 'pointerup',
        'MSPointerOut' : 'pointerout',
        'MSPointerOver' : 'pointerover',
        'MSPointerCancel' : 'pointercancel',
        'MSGotPointerCapture' : 'gotpointercapture',
        'MSLostPointerCapture' : 'lostpointercapture'
    },
    POINTER_TYPES = [
        '',
        'unavailable',
        'touch',
        'pen',
        'mouse'
    ],    
    handleMSPointerEvent = function(evt){

        // create new MSPointerEvent 
        // http://msdn.microsoft.com/en-us/library/ie/hh772103%28v=vs.85%29.aspx
        var e  = document.createEvent('MSPointerEvent'),
            target = evt.target;

        // block original event from further propagation
        evt.stopPropagation();

        // we can't dispatch existing event so we create a new one based on 
        // original pointer event and using unprefixed event type
        // http://msdn.microsoft.com/en-us/library/ie/hh772109%28v=vs.85%29.aspx  
        e.initPointerEvent(EVENTS_MAP[evt.type], true, true, evt.view, evt.detail, evt.screenX, evt.screenY,
            evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, evt.button,
            evt.relatedTarget, evt.offsetX, evt.offsetY, evt.width, evt.height, evt.pressure, evt.rotation,
            evt.tiltX, evt.tiltY, evt.pointerId, POINTER_TYPES[evt.pointerType], evt.hwTimestamp, evt.isPrimary);

        // override pointerType property to be w3c specification compliant (string representation instead of int constant)
        Object.defineProperty(e, "pointerType", {get: function(){ return  POINTER_TYPES[evt.pointerType]}, enumerable: true});

        target.dispatchEvent(e);

    }, 
    addTouchActionBasicFallbackRules = function () {
        // to be compliant with other popular Pointer Events polyfills like google Polymer
        // which usese custom 'touch-action' attribute instead of corresponding CSS rule
        // we add these basic css fallback rules for 'touch-action' attribute

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = 
            '*[touch-action="none"] { -ms-touch-action: none; } ' + 
            '*[touch-action="auto"] { -ms-touch-action: auto; } ' +
            '*[touch-action="pan-x"] { -ms-touch-action: pan-x; } ' +
            '*[touch-action="pan-y"] { -ms-touch-action: pan-y; } ';            
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    for (var msEventName in EVENTS_MAP){
        document.addEventListener(msEventName, handleMSPointerEvent, true);
    };

    addTouchActionBasicFallbackRules();

})()