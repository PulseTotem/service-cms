/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />

/// <reference path="../core/ServiceConfig.ts" />
/// <reference path="../core/Helper.ts" />

/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/FeedContent.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/FeedNode.ts" />

var uuid : any = require('node-uuid');
var moment : any = require('moment');

/**
 * Represents the GetNewsFeed CMS's Source.
 *
 * @class GetNewsFeed
 * @extends SourceItf
 */
class GetNewsFeed extends SourceItf {

	/**
	 * Constructor.
	 *
	 * @param {Object} params - Source's params.
	 * @param {CMSNamespaceManager} cmsNamespaceManager - NamespaceManager attached to Source.
	 */
	constructor(params : any, cmsNamespaceManager : CMSNamespaceManager) {
		super(params, cmsNamespaceManager);

		if (this.checkParams(["Limit", "InfoDuration", "NewsFeedID"])) {
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

		var successRetrieveNewsFeed = function(result) {
			var info = result.data();

			var feedContent : FeedContent = new FeedContent();
			feedContent.setId(info.id);
			var creationDate : any = moment(info.createdAt);
			feedContent.setCreationDate(creationDate.toDate());
			feedContent.setTitle(info.name);
			feedContent.setDescription(info.description);

			var successRetrieveNews = function(newsResult) {
				var newsList = newsResult.data();

				if(newsList.length > 0) {
					newsList.forEach(function(news : any) {

						var newsBeginDate:any = null;
						if(news.begin != undefined && news.begin != null && news.begin != '') {
							newsBeginDate = moment(news.begin);
						}

						var newsEndDate:any = null;
						if(news.end != undefined && news.end != null && news.end != '') {
							newsEndDate = moment(news.end);
						}

						var now : any = moment();

						if(
							(newsBeginDate == null && newsEndDate == null) ||
							(newsBeginDate != null && newsEndDate == null && now.diff(newsBeginDate) >= 0) ||
							(newsBeginDate != null && newsEndDate != null && now.diff(newsBeginDate) >= 0 && newsEndDate.diff(now) >= 0)
						) {
							var feedNode:FeedNode = new FeedNode();
							feedNode.setId(news.id);
							var newsCreationDate:any = moment(news.createdAt);
							feedNode.setCreationDate(newsCreationDate.toDate());

							if(newsEndDate != null) {
								feedNode.setObsoleteDate(newsEndDate.toDate());
							}

							feedNode.setDurationToDisplay(parseInt(self.getParams().InfoDuration));

							feedNode.setTitle(news.title);
							feedNode.setSummary(news.content);
							feedNode.setDescription(news.content);

							if (news.picture != null) {
								feedNode.setMediaUrl(ServiceConfig.getCMSHost() + "images/" + news.picture.id + "/raw?size=large");
							}

							feedContent.addFeedNode(feedNode);
						}
					});
				};

				feedContent.setDurationToDisplay(parseInt(self.getParams().InfoDuration) * feedContent.getFeedNodes().length);
				self.getSourceNamespaceManager().sendNewInfoToClient(feedContent);
			};

			var retrieveNewsUrl = ServiceConfig.getCMSHost() + "admin/news_collections/" + self.getParams().NewsFeedID + "/news";

			Helper.performGetRequest(retrieveNewsUrl, successRetrieveNews, fail);
		};

		var retrieveNewsFeedUrl = ServiceConfig.getCMSHost() + "admin/news_collections/" + self.getParams().NewsFeedID;

		Helper.performGetRequest(retrieveNewsFeedUrl, successRetrieveNewsFeed, fail);
	}


}