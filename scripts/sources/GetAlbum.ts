/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />

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

		var success = function(oauthActions) {
			var successPageDesc = function(pageDesc) {

				var feedContent : FeedContent = new FeedContent();
				if(typeof(pageDesc.id) != "undefined") {
					feedContent.setId(pageDesc.id);
				} else {
					feedContent.setId(uuid.v1());
				}
				if(typeof(pageDesc.username) != "undefined") {
					feedContent.setTitle(pageDesc.username);
				} else {
					feedContent.setTitle(self.getParams().PageName);
				}
				if(typeof(pageDesc.description) != "undefined") {
					feedContent.setDescription(pageDesc.description);
				}
				if(typeof(pageDesc.likes) != "undefined") {
					feedContent.getSocialStats().setLikeCount(pageDesc.likes);
				}

				var successPostsDesc = function(postsDesc) {

					postsDesc.data.forEach(function(post) {
						var newFeedNode : FeedNode = new FeedNode();

						if(typeof(post.id) != "undefined") {
							newFeedNode.setId(post.id);
						} else {
							newFeedNode.setId(uuid.v1());
						}
						if(typeof(post.created_time) != "undefined") {
							var creationDate : any = moment(post.created_time);
							newFeedNode.setCreationDate(creationDate.toDate());
						} else {
							var creationDate : any = moment();
							newFeedNode.setCreationDate(creationDate.toDate());
						}
						if(typeof(post.message) != "undefined") {
							newFeedNode.setDescription(post.message);
						}
						if(typeof(post.likes) != "undefined" && typeof(post.likes.data) != "undefined") {
							newFeedNode.getSocialStats().setLikeCount(post.likes.data.length);
						}
						if(typeof(post.comments) != "undefined" && typeof(post.comments.data) != "undefined") {
							newFeedNode.getSocialStats().setCommentCount(post.comments.data.length);
						}
						if(typeof(post.from) != "undefined" && typeof(post.from.name) != "undefined") {
							newFeedNode.setAuthor(post.from.name);
						}
						if(typeof(post.shares) != "undefined" && typeof(post.shares.count) != "undefined") {
							newFeedNode.getSocialStats().setShareCount(post.shares.count);
						}
						if(typeof(post.full_picture) != "undefined") {
							newFeedNode.setMediaUrl(post.full_picture);
						}
						if(typeof(post.link) != "undefined") {
							newFeedNode.setUrl(post.link);
						}
						if(typeof(post.name) != "undefined") {
							newFeedNode.setTitle(post.name);
						}

						newFeedNode.setDurationToDisplay(parseInt(self.getParams().InfoDuration));

						feedContent.addFeedNode(newFeedNode);
					});

					feedContent.setDurationToDisplay(parseInt(self.getParams().InfoDuration) * feedContent.getFeedNodes().length);
					self.getSourceNamespaceManager().sendNewInfoToClient(feedContent);
				};

				var postsDescURL = 'https://graph.facebook.com/v2.5/' + self.getParams().PageName + '/posts?fields=message,name,type,created_time,link,shares,likes,from,full_picture,id,comments&limit=' + self.getParams().Limit;
				oauthActions.get(postsDescURL, successPostsDesc, fail);
			};

			var pageDescURL = 'https://graph.facebook.com/v2.5/' + self.getParams().PageName + '?fields=description,id,likes,username';

			oauthActions.get(pageDescURL, successPageDesc, fail);
		};

		self.getSourceNamespaceManager().manageOAuth('facebook', self.getParams().oauthKey, success, fail);
	}
}