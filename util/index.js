'use strict';

function getYear() {
    return new Date().getFullYear();
}
function getMonth() {
    var month = new Date().getMonth()+1;
    if (month < 10) {
        month = '0' + month
    }
    return month;
}
function getDate() {
    var date = new Date().getDate();
    if (date < 10) {
        date = '0' + date
    }
    return date;
}
function getHours() {
    var hour = new Date().getHours();
    if (hour < 10) {
        hour = '0' + hour
    }
    return hour;
}
function getMinutes() {
    var minute = new Date().getMinutes();
    if (minute < 10) {
        minute = '0' + minute
    }
    return minute;
}
function getSeconds() {
    var second = new Date().getSeconds();
    if (second < 10) {
        second = '0' + second
    }
    return second;
}
module.exports.getTime = (key, data) => {
    let returnobj = "";

    if (key == undefined || key == "") returnobj += getYear() + getMonth() + getDate() + "-" + getHours() + ":" + getMinutes() + ":" + getSeconds();
    else if (key == "date") returnobj += getYear() + getMonth() + 
    getDate();
    else if (key == "time") returnobj += getHours() + ":" + getMinutes() + ":" + getSeconds();
    else {
        option = data.split(",");
        
        if (option.includes("year")) returnobj += getYear();
        if (option.includes("month")) returnobj += getMonth();
        if (option.includes("date")) returnobj += getDate();
        if (option.includes("hour")) returnobj == "" ? returnobj += getHours() + ":" : returnobj += "-" + getHours() + ":";
        if (option.includes("minute")) returnobj += getMinutes() + ":";
        if (option.includes("second")) returnobj += getSeconds();
    }

    return returnobj;
}

// Origin: http://mwultong.blogspot.com/2007/01/isnum-isnumeric-isnumber-javascript.html

module.exports.isNumber = (s) => {
    s += ''; // 문자열로 변환
    s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
    if (s == '' || isNaN(s)) return false;
    return true;
  }


// Origin: https://github.com/awais786327/oauth2orize-examples

/**
 * Return a unique identifier with the given `len`.
 *
 * @param {Number} length
 * @return {String}
 * @api private
 */
module.exports.getUid = function(length) {
    let uid = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;
  
    for (let i = 0; i < length; ++i) {
      uid += chars[getRandomInt(0, charsLength - 1)];
    }
  
    return uid;
  };
  
  /**
   * Return a random int, used by `utils.getUid()`.
   *
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   * @api private
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }