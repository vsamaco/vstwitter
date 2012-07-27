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
      this.save({favorite: !this.get('favorite')});
    }
  });

  var TweetList = Backbone.Collection.extend({
    model: Tweet
  });

  var TweetView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#tweet-template").html()),
    events: {
      "click .favorite" : "toggleFavorite"
    },
  
    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },
  
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('favorite', this.model.get('favorite'));
      return this;
    },
  
    remove: function() {
      this.remove();
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
      "click .submit" : "submitTweet"
    },
  
    initialize: function() {
      this.tweetList = new TweetList;
      this.tweetListView = new TweetListView({collection: this.tweetList});
      this.input = this.$('#tweet-message');
    },
  
    render: function() {
      return this;
    },
    
    submitTweet: function() {
      var message = this.input.val();
      if(!message) return;
      
      this.tweetList.add({message: message});
      console.log('done');
      this.input.val('');
    }
  });
  
  window.app = new TweetApp;
});
