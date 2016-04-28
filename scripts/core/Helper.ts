/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/RestClient.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/RestClientResponse.ts" />

/**
 * Helper for CMS Service.
 *
 * @class Helper
 */
class Helper {

	/**
	 * Return CMS Host.
	 *
	 * @method performGetRequest
	 * @static
	 * @param {string} url - URL to request
	 * @param {Function} successCallback - Success callback function
	 * @param {Function} failCallback - Fail callback function
	 */
	static performGetRequest(url, successCallback, failCallback) {
		var RestClientSuccess : Function = function(data, response) {
			var dataJSON;

			if(typeof(data) == "string" || data instanceof Buffer) {
				dataJSON = JSON.parse(data);
			} else {
				dataJSON = data;
			}
			var result : RestClientResponse = new RestClientResponse(true, response, dataJSON);
			successCallback(result);
		};

		var RestClientFail : Function = function(data, response) {
			var dataJSON;

			if(typeof(data) == "string" || data instanceof Buffer) {
				dataJSON = JSON.parse(data);
			} else {
				dataJSON = data;
			}
			var result : RestClientResponse = new RestClientResponse(false, response, dataJSON);
			failCallback(result);
		};

		var args = {
			"headers": {
				"Content-Type": "application/json",
				"Authorization": ServiceConfig.getCMSAuthKey()
			}
		};

		var req = RestClient.getClient().get(url, args, function(data, response) {
			if(response.statusCode >= 200 && response.statusCode < 300) {
				RestClientSuccess(data, response);
			} else {
				RestClientFail(data, response);
			}
		});
		req.on('error', RestClientFail);
	}
}