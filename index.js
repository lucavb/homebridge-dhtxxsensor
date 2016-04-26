var Service;
var Characteristic;
var HomebridgeAPI;
var dht = require('dht-sensor');

// dht22 seems to need a timeout between measurements
var timeDifference = 2500;

function diffBigEnough(last) {
	var now = new Date();
	if ( (now.getTime() - last.getTime()) < timeDifference) {
		return false;
	} else {
		return true;
	}
}

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;

    homebridge.registerAccessory("homebridge-dhtxxsensor", "dhtxxsensor", DHTXXSensor);
}

function DHTXXSensor(log, config) {
	this.log = log;
	this.name = config.name;
	this.gpioId = config.gpioId;
	this.type = config.type;
	this.lastTimestamp = new Date();
	this.lastRecord = dht.read(this.type, this.gpioId);

	// info service
	this.informationService = new Service.AccessoryInformation();
		
	this.informationService
	.setCharacteristic(Characteristic.Manufacturer, config.manufacturer || "Englewood")
	.setCharacteristic(Characteristic.Model, config.model || "DHT" + this.type)
	.setCharacteristic(Characteristic.SerialNumber, config.serial || "773D80FF");

	this.service_therm = new Service.TemperatureSensor(this.name);
	this.service_humid = new Service.HumiditySensor(this.name);

	this.service_therm.getCharacteristic(Characteristic.CurrentTemperature)
		.on('get', this.getTemp.bind(this));
	// this.service_therm.setCharacteristic(Characteristic.Model, "DHT22");

	this.service_humid.getCharacteristic(Characteristic.CurrentRelativeHumidity)
		.on('get', this.getHumid.bind(this));
	// this.service_humid.setCharacteristic(Characteristic.Model, "DHT22");
}

DHTXXSensor.prototype.getHumid = function(callback) {
	var current;
	if (diffBigEnough(this.lastTimestamp)) {
		this.lastTimestamp = new Date();
		current = dht.read(this.type, this.gpioId);
	} else {
		current = this.lastRecord;
	}
	callback(null, current.humidity);
}

DHTXXSensor.prototype.getTemp = function(callback) {
	var current;
	if (diffBigEnough(this.lastTimestamp)) {
		this.lastTimestamp = new Date();
		current = dht.read(this.type, this.gpioId);
	} else {
		current = this.lastRecord;
	}
	callback(null, current.temperature); 
}

DHTXXSensor.prototype.getServices = function() {

  return [this.informationService, this.service_therm, this.service_humid];
}