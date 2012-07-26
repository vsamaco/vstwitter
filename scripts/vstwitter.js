var Tweet = Backbone.Model.extend({
  defaults: function() {
    return {
      name: 'User',
      message: '',
      timestamp: new Date()
    }
  }
});

var TweetCollection = Backbone.Collection.extend({
  model: Tweet
});

var TweetView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($("#tweet-template")),
  
  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },
  
  remove: function() {
    this.remove();
  }
});

var TweetsView = Backbone.View.extend({
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
    this.$el.append(view.render().el);
  },
  
  addAll: function() {
    this.$el.empty();
    this.collection.forEach(this.addOne, this);
  }
});

var TweetApp = Backbone.View.extend({
  
});
