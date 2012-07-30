$(function() {  
  var Tweet = Backbone.Model.extend({
    defaults: function() {
      return {
        name: 'User',
        message: '',
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
      "click .delete" : "remove"
    },
  
    initialize: function() {
      this.model.on('change', this.render, this);
    },
  
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('favorite', this.model.get('favorite'));
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

  var TweetApp = Backbone.View.extend({
    el: $("#app"),
    events: {
      "click .submit" : "submitTweet",
      "keyup #tweet-message" : "updateCounter"
    },
  
    initialize: function() {
      this.tweetList = new TweetList;
      this.tweetListView = new TweetListView({collection: this.tweetList});
      this.input = this.$('#tweet-message');
      
      this.tweetMaxCount = 140;
      this.tweetCounter = this.$("#tweet-count");
      
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
      } else {
        this.tweetCounter.removeClass('maxed');
      }
      
      this.tweetCounter.text(tweetCount);
    },
    
    submitTweet: function() {
      var message = this.input.val();
      if (!message) return;
      
      if (message.length > this.tweetMaxCount) return;
      
      this.tweetList.create({message: message});
      this.input.val('');
      this.updateCounter();
    }
  });
  
  window.app = new TweetApp;
});
