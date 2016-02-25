/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/RestClient.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/RestClientResponse.ts" />

/// <reference path="../core/ServiceConfig.ts" />

/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/PictureAlbum.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/Picture.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/PictureURL.ts" />

var uuid : any = require('node-uuid');
var moment : any = require('moment');

/**
 * Represents the GetAlbum CMS's Source.
 *
 * @class GetAlbum
 * @extends SourceItf
 */
class GetAlbum extends SourceItf {

	/**
	 * Constructor.
	 *
	 * @param {Object} params - Source's params.
	 * @param {CMSNamespaceManager} cmsNamespaceManager - NamespaceManager attached to Source.
	 */
	constructor(params : any, cmsNamespaceManager : CMSNamespaceManager) {
		super(params, cmsNamespaceManager);

		if (this.checkParams(["Limit", "InfoDuration", "AlbumId"])) {
			this.run();
		}
	}

	run() {
		var self = this;

		var fail = function(error) {
			if(error) {
				Logger.error(error);
			}
		};

		var successRetrieveAlbum = function(result) {
			var info = result.data();

			var pictureAlbum : PictureAlbum = new PictureAlbum();
			pictureAlbum.setId(info.id);
			var creationDate : any = moment(info.createdAt);
			pictureAlbum.setCreationDate(creationDate.toDate());


			if(info.images.length > 0) {
				info.images.forEach(function(image) {
					var picture : Picture = new Picture();
					picture.setId(image.id);
					var pictureCreationDate : any = moment(image.createdAt);
					picture.setCreationDate(pictureCreationDate.toDate());
					picture.setDurationToDisplay(parseInt(self.getParams().InfoDuration));

					picture.setTitle(image.name);
					picture.setDescription(image.description);

					var pictureURL : PictureURL = new PictureURL();
					pictureURL.setURL(ServiceConfig.getCMSHost() + "images/" + image.id + "/raw");

					picture.setOriginal(pictureURL);
					picture.setLarge(pictureURL);

					pictureAlbum.addPicture(picture);
				});
			}

			pictureAlbum.setDurationToDisplay(parseInt(self.getParams().InfoDuration) * pictureAlbum.getPictures().length);
			self.getSourceNamespaceManager().sendNewInfoToClient(pictureAlbum);
		};

		var retrieveAlbumUrl = ServiceConfig.getCMSHost() + "admin/images_collections/" + self.getParams().AlbumId;

		var RestClientSuccess : Function = function(data, response) {
			var dataJSON;

			if(typeof(data) == "string" || data instanceof Buffer) {
				dataJSON = JSON.parse(data);
			} else {
				dataJSON = data;
			}
			var result : RestClientResponse = new RestClientResponse(true, response, dataJSON);
			successRetrieveAlbum(result);
		};

		var RestClientFail : Function = function(error) {
			var result : RestClientResponse = new RestClientResponse(false, error);
			fail(result);
		};

		var args = {
			"headers": {
				"Content-Type": "application/json",
				"Authorization": ServiceConfig.getCMSAuthKey()
			}
		};

		var req = RestClient.getClient().get(retrieveAlbumUrl, args, function(data, response) {
			if(response.statusCode >= 200 && response.statusCode < 300) {
				RestClientSuccess(data, response);
			} else {
				RestClientFail(data);
			}
		});
		req.on('error', RestClientFail);
	}
}