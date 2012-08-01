$(function() {  
  var Tweet = Backbone.Model.extend({
    defaults: function() {
      return {
        name: 'User',
        message: '',
        avatar: 'default',
        timestamp: new Date(),
        favorite: false
      }
    },
    
    toggleFavorite: function() {
      this.set('favorite', !this.get('favorite'));
    }
  });

  var TweetList = Backbone.Collection.extend({
    model: Tweet,
    noPersistence: new bnp.NoPersistence() // disable persistence
  });

  var TweetView = Backbone.View.extend({
    tagName: 'li',
    className: 'tweet',
    template: _.template($("#tweet-template").html()),
    events: {
      "click .favorite" : "toggleFavorite",
      "click .delete" : "remove",
      "click .reply" : "reply",
    },
  
    initialize: function() {
      this.model.on('change', this.render, this);
    },
  
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$("a.favorite").toggleClass('on', this.model.get('favorite'));
      return this;
    },
  
    remove: function() {
      var self = this;
      this.model.destroy({
        success: function(model, response) {
          self.$el.remove();
        }
      })
    },
    
    toggleFavorite: function() {
      this.model.toggleFavorite();
    },
    
    reply: function() {
      window.eventAggregator.trigger("setupReply", this.model);
    }
  });

  var TweetListView = Backbone.View.extend({
    el: $("#tweets-container"),
    
    initialize: function() {      
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
    },
  
    render: function() {
      this.addAll();
      return this;
    },
  
    addOne: function(tweet) {
      var view = new TweetView({model: tweet});
      this.$el.prepend(view.render().el);
    },
  
    addAll: function() {
      this.$el.empty();
      this.collection.forEach(this.addOne, this);
    }
  });
  
  var UserView = Backbone.View.extend({
    events: {
      "click .avatars a" : "selectAvatar",
      "click .save" : "saveUser",
      "click .display-user" : "openEdit"
    },
    
    initialize: function() {
      this.username = "User";
      this.avatar = "default";
      
      this.editUser = this.$(".edit-user");
      this.username_input = this.$("input.username", this.editUser);
      this.avatars = this.$(".avatars a", this.editUser);
      
      this.displayUser = this.$(".display-user");
      this.username_display = this.$(".username", this.displayUser);
      this.avatar_display = this.$(".avatar", this.displayUser);
      
      this.openEdit();
    },
    
    selectAvatar: function(e) {
      this.avatars.removeClass("selected");
      $(e.target).addClass("selected");
    },
    
    getUsername: function() {
      return this.username;
    },
    
    getAvatar: function() {
      return this.avatar;
    },
    
    saveUser: function() {
      this.username = this.username_input.val() || "User";
      this.avatar = this.$(".selected", this.avatars).attr("data-value") || "default";
      
      this.username_display.html(this.username);
      this.avatar_display.html('<a class="' + this.avatar + '"></a>');
      
      this.displayUser.show();
      this.editUser.hide();
      
      window.eventAggregator.trigger("toggleMessage", this);
    },
    
    openEdit: function() {
      this.displayUser.hide();
      this.editUser.show();
      
      window.eventAggregator.trigger("toggleMessage", this);
    }
  });

  var TweetApp = Backbone.View.extend({
    el: $("#app"),
    events: {
      "click .submit" : "submitTweet",
      "keyup #tweet-message" : "updateCounter"
    },
  
    initialize: function() {
      this.userView = new UserView({el: $("#user-box")});
      this.userView.getAvatar();
      
      this.tweetList = new TweetList;
      this.tweetListView = new TweetListView({collection: this.tweetList});
      
      this.tweetBox = this.$("#tweet-box");
      this.tweetBox.hide();
      
      this.input = this.$('#tweet-message', this.tweetBox);
      this.submit = this.$('.submit', this.tweetBox);
      
      this.tweetMaxCount = 140;
      this.tweetCounter = this.$("#tweet-count");
      
      window.eventAggregator.on('setupReply', this.setupReply, this);
      window.eventAggregator.on('toggleMessage', this.toggleMessage, this);
      
      this.render();
      this.$("time.timeago").livequery(function() {
        $(this).timeago();
      });
    },
  
    render: function() {
      this.updateCounter();
      return this;
    },
    
    updateCounter: function() {
      var tweetLength = this.input.val().length;
      var tweetCount = this.tweetMaxCount - tweetLength;
      
      if (tweetCount < 0) {
        this.tweetCounter.addClass('maxed');
        this.submit.attr('disabled', true);
      } else {
        this.tweetCounter.removeClass('maxed');
        this.submit.attr('disabled', false);
      }
      
      this.tweetCounter.text(tweetCount);
    },
    
    submitTweet: function() {
      var username = this.userView.getUsername();
      var avatar = this.userView.getAvatar();
      var message = this.input.val();
      
      if (!message || !username) return;
      
      if (message.length > this.tweetMaxCount) return;
      
      this.tweetList.create({name: username, avatar: avatar, message: message});
      this.input.val('');
      this.updateCounter();
    },
    
    setupReply: function(tweet) {
      var name = "@" + tweet.get("name") + " ";
      this.input.focus();
      this.input.val(name);
    },
    
    toggleMessage: function() {
      this.tweetBox.toggle();
    }
  });
  
  window.eventAggregator = _.extend({}, Backbone.Events);
  
  window.app = new TweetApp;
});
