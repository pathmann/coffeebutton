/*
Let the puck.js call the switchbot on the coffee maker.

Will try to access switchbot BLE 5 times, on success, flash the green light,
if all 5 tries are unsuccessfull, flash the red light.
*/

var data = String.fromCharCode(0x57) + String.fromCharCode(0x01);
var mac = "aa:aa:aa:aa:aa:aa random";
var maxtries = 5;
var stilltrying = false;

function flashLED(pin, timeout) {
  digitalWrite(pin, true);
  setTimeout(function() {
    digitalWrite(pin, false);
  }, timeout);
}

function pushIt(tries) {
  if (tries == 0) {
    stilltrying = false;
    flashLED(LED1, 2000);
    return;
  }
  
  var gatt;
  NRF.connect(mac).then(function(g) {
    gatt = g;
    return gatt.getPrimaryService("CBA20D00-224D-11E6-9FB8-0002A5D5C51B");
  }).then(function(service) {
    return service.getCharacteristic("CBA20002-224D-11E6-9FB8-0002A5D5C51B");
  }).then(function(characteristic) {
    return characteristic.writeValue(data);
  }).then(function() {
    stilltrying = false;
    gatt.disconnect();
    flashLED(LED2, 2000);
  }).catch(function() {
    pushIt(tries -1);
  });
}

setWatch(function() {
  if (stilltrying) {
    flashLED(LED3, 2000);
    return;
  }
  
  stilltrying = true;
  pushIt(maxtries);
}, BTN, { repeat:true, edge:"rising", debounce:50 });
