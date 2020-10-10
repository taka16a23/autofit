/*
 * autofit.js v0.0.1
 * 
 * Copyright 2020 atami
 * 
 * https://github.com/taka16a23/autofit.js.git
 *
 */
 
class AbstractAutofit {
    preExecute() {}
    isOverflowed() {}
    autofit() {}
    postExecute() {}
}

class BaseAutofit extends AbstractAutofit {
    constructor(a_oElement) {
        super();
        this.m_oElement = a_oElement;
    }

    isOverflowed() {
        // for safe
        return false;
    }
}

class Autofit extends BaseAutofit {
    constructor(a_oElement) {
        super(a_oElement);
        this.m_iMaxCount = 500;
        this.m_ftShrinkSize = 0.1;
        // save style
        var t_style = document.defaultView.getComputedStyle(this.m_oElement);
        this.m_sSavedMaxWidth = t_style.maxWidth;
        this.m_sSavedOverflowX = t_style.overflowX;
        this.m_sBeforeFontSize = t_style.fontSize;
    }

    preExecute() {
        // prevent strech size
        if(this.m_oElement.style.maxWidth == 'none') {
            this.m_oElement.style.maxWidth = this.m_oElement.clientWidth;
        }
        // prevent multi line
        this.m_oElement.style.whiteSpace = "nowrap";
        // make real width for text
        this.m_oElement.style.overflowX = "scroll";
    }

    isOverflowed() {
        // prevent bad element
        if(!this.m_oElement) {
            return false;
        }
        // true if real text width than viewable
        if(this.m_oElement.clientWidth < this.m_oElement.scrollWidth) {
            return true;
        }
        return false;
    }

    autofit() {
        // prevent infinity loop counter
        var t_iCount = 0;
        while(this.isOverflowed() == true) {
            // windows Chrome minimum font size 10px
            if(this.m_iMaxCount < t_iCount) {
                break;
            }
            t_iCount = t_iCount + 1;
            var t_ftFontSize = parseFloat(document.defaultView.getComputedStyle(this.m_oElement).fontSize);
            // shrink size
            t_ftFontSize = t_ftFontSize - this.m_ftShrinkSize;
            if(t_ftFontSize <= 0) {
                break;
            }
            // set new font sizs
            this.m_oElement.style.fontSize = t_ftFontSize + 'px';
        }
    }

    postExecute() {
        // restore style
        this.m_oElement.style.maxWidth = this.m_sSavedMaxWidth;
        this.m_oElement.style.overflowX = this.m_sSavedOverflowX;
    }
}

class SVGAutofit extends BaseAutofit {
    constructor(a_oElement) {
        super(a_oElement);
        this.m_oSVGElement = a_oElement;
        var t_lsChild = this.m_oSVGElement.getElementsByTagName('text');
        if(t_lsChild.length <= 0) {
            throw 'missing text tag in children';
        }
        this.m_oTextElement = t_lsChild[0];
        // save style
        var t_style = document.defaultView.getComputedStyle(this.m_oElement);
        this.m_sSavedMaxWidth = t_style.maxWidth;
        this.m_sSavedOverflowX = t_style.overflowX;
        this.m_ftShrinkSize = 0.1;
        this.m_iMaxCount = 500;
    }

    preExecute() {
        // prevent strech size
        if(this.m_oTextElement.style.maxWidth == 'none') {
            this.m_oTextElement.style.maxWidth = this.m_oSVGElement.clientWidth;
        }
        // prevent multi line
        this.m_oTextElement.style.whiteSpace = "nowrap";
        // make real width for text
        this.m_oTextElement.style.overflowX = "scroll";
    }

    isOverflowed() {
        // compare svg client and real text width
        if(this.m_oSVGElement.clientWidth < this.m_oTextElement.scrollWidth) {
            return true;
        }
        return false;
    }
    
    autofit() {
        var t_iCount = 0;
        while(this.isOverflowed() == true) {
            // windows Chrome minimum font size 10px
            if(this.m_iMaxCount < t_iCount) {
                break;
            }
            t_iCount = t_iCount + 1;
            var t_ftFontSize = parseFloat(document.defaultView.getComputedStyle(this.m_oTextElement).fontSize);
            // shrink size
            t_ftFontSize = t_ftFontSize - this.m_ftShrinkSize;
            if(t_ftFontSize <= 0) {
                break;
            }
            // set new font sizs
            this.m_oTextElement.style.fontSize = t_ftFontSize + 'px';
        }
        // if until overflowed over 10px
        if(this.isOverflowed() == true) {
            this.m_oTextElement.setAttribute('textLength', '100%');
        }
    }

    postExecute() {
        // restore style
        this.m_oTextElement.style.maxWidth = this.m_sSavedMaxWidth;
        this.m_oTextElement.style.overflowX = this.m_sSavedOverflowX;
    }
}

function createAutoFit(a_oElement) {
    if(!a_oElement) {
        return;
    }
    // svg tag
    if(a_oElement.nodeName == 'svg') {
        return new SVGAutofit(a_oElement);
    }
    return new Autofit(a_oElement);
}

function runAutofit() {
    // get autofit class element list
    var autofits = document.getElementsByClassName('autofit');
    // do each element to autofit
    Array.from(autofits).forEach(function (el) {
        var t_oAutofit = createAutoFit(el);
        t_oAutofit.preExecute();
        t_oAutofit.autofit();
        t_oAutofit.postExecute();
    });    
}

window.addEventListener('load', runAutofit);
