/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */
/// <reference path="../t6s-core/core-backend/scripts/server/SourceServer.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />

/// <reference path="./CMSNamespaceManager.ts" />

class CMS extends SourceServer {

	/**
	 * Constructor.
	 *
	 * @param {number} listeningPort - Server's listening port..
	 * @param {Array<string>} arguments - Server's command line arguments.
	 */
	constructor(listeningPort : number, arguments : Array<string>) {
		super(listeningPort, arguments);

		this.init();
	}

	/**
	 * Method to init the CMS server.
	 *
	 * @method init
	 */
	init() {
		var self = this;

		this.addNamespace("CMS", CMSNamespaceManager);
	}
}

/**
 * Server's CMS listening port.
 *
 * @property _CMSListeningPort
 * @type number
 * @private
 */
var _CMSListeningPort : number = process.env.PORT || 6018;

/**
 * Server's CMS command line arguments.
 *
 * @property _CMSArguments
 * @type Array<string>
 * @private
 */
var _CMSArguments : Array<string> = process.argv;

var serverInstance = new CMS(_CMSListeningPort, _CMSArguments);
serverInstance.run();