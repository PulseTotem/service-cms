/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/libsdef/node-uuid.d.ts" />

/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../t6s-core/core-backend/scripts/server/SourceNamespaceManager.ts" />

/// <reference path="./sources/GetAlbum.ts" />
/// <reference path="./sources/GetNewsFeed.ts" />

class CMSNamespaceManager extends SourceNamespaceManager {

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {any} socket - The socket.
	 */
	constructor(socket : any) {
		super(socket);
		this.addListenerToSocket('GetAlbum', function (params, self) { new GetAlbum(params, self); });
		this.addListenerToSocket('GetNewsFeed', function (params, self) { new GetNewsFeed(params, self); });
	}
}